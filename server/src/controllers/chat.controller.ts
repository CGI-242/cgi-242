// server/src/controllers/chat.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { orchestrator } from '../orchestrator/index.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { createLogger } from '../utils/logger.js';
import { generateChatResponseStream } from '../services/rag/chat.service.js';

interface CitationJson {
  articleNumber: string;
  titre?: string;
  excerpt: string;
  score: number;
}

const logger = createLogger('ChatController');


/**
 * Obtenir les conversations de l'utilisateur
 */
export async function getConversations(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const orgId = req.tenant?.type === 'organization' ? req.tenant.organizationId : null;

    const conversations = await prisma.conversation.findMany({
      where: orgId
        ? { organizationId: orgId }
        : { creatorId: userId, organizationId: null },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });

    sendSuccess(res, conversations);
  } catch (error) {
    logger.error('Erreur getConversations:', error);
    sendError(res, 'Erreur lors de la récupération', 500);
  }
}

/**
 * Obtenir une conversation avec ses messages
 */
export async function getConversation(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            citations: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation) {
      sendError(res, 'Conversation non trouvée', 404);
      return;
    }

    sendSuccess(res, conversation);
  } catch (error) {
    logger.error('Erreur getConversation:', error);
    sendError(res, 'Erreur lors de la récupération', 500);
  }
}

/**
 * Envoyer un message à l'agent CGI
 */
export async function sendMessageOrchestrated(req: Request, res: Response): Promise<void> {
  try {
    const { content, conversationId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, 'Non autorisé', 401);
      return;
    }

    const orgId = req.tenant?.type === 'organization' ? req.tenant.organizationId : null;

    // Transaction: Récupérer/créer conversation + sauvegarder message utilisateur
    const { conversation } = await prisma.$transaction(async (tx) => {
      // Récupérer ou créer la conversation avec upsert pattern
      let conv;
      if (conversationId) {
        conv = await tx.conversation.findUnique({
          where: { id: conversationId },
          include: { messages: { orderBy: { createdAt: 'asc' }, take: 10 } },
        });
      }

      if (!conv) {
        conv = await tx.conversation.create({
          data: {
            creatorId: userId,
            organizationId: orgId,
            title: content.substring(0, 50),
          },
          include: { messages: true },
        });
      }

      // Sauvegarder le message utilisateur dans la même transaction
      await tx.message.create({
        data: {
          conversationId: conv.id,
          authorId: userId,
          role: 'USER',
          content,
        },
      });

      return { conversation: conv };
    });

    // Préparer le contexte pour l'orchestrateur
    const previousMessages = conversation.messages.map((m) => ({
      role: m.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    const agentContext = {
      userId,
      organizationId: req.tenant?.type === 'organization' ? req.tenant.organizationId : undefined,
      conversationId: conversation.id,
      previousMessages,
    };

    // Traiter avec l'agent CGI
    const orchestratorResponse = await orchestrator.processQuery(content, agentContext);

    // Convertir les sources en citations
    const citations: CitationJson[] = orchestratorResponse.sources.map((s) => ({
      articleNumber: s.numero,
      titre: s.titre,
      excerpt: s.extrait,
      score: 0.8,
    }));

    // Transaction: Sauvegarder la réponse + mettre à jour titre + récupérer conversation
    const { assistantMessage, updatedConversation } = await prisma.$transaction(async (tx) => {
      // Sauvegarder la réponse assistant
      const assistantMsg = await tx.message.create({
        data: {
          conversationId: conversation.id,
          role: 'ASSISTANT',
          content: orchestratorResponse.answer,
          citations: JSON.parse(JSON.stringify(citations)),
          responseTime: orchestratorResponse.processingTime,
        },
      });

      // Mettre à jour le titre si c'est le premier message
      if (conversation.messages.length === 0) {
        await tx.conversation.update({
          where: { id: conversation.id },
          data: { title: content.substring(0, 50) },
        });
      }

      // Récupérer la conversation mise à jour
      const updatedConv = await tx.conversation.findUnique({
        where: { id: conversation.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              role: true,
              content: true,
              citations: true,
              createdAt: true,
            },
          },
        },
      });

      return { assistantMessage: assistantMsg, updatedConversation: updatedConv };
    });

    logger.info(
      `[CGI] Message traité - Agent: ${orchestratorResponse.routing.agentUsed}, Time: ${orchestratorResponse.processingTime}ms`
    );

    sendSuccess(res, {
      conversation: updatedConversation,
      message: {
        id: assistantMessage.id,
        role: 'ASSISTANT',
        content: orchestratorResponse.answer,
        citations,
      },
      routing: orchestratorResponse.routing,
    });
  } catch (error) {
    logger.error('Erreur sendMessageOrchestrated:', error);
    sendError(res, 'Erreur lors du traitement du message', 500);
  }
}

/**
 * Supprimer une conversation et tous ses messages
 */
export async function deleteConversation(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, 'Non autorisé', 401);
      return;
    }

    // Vérifier que la conversation existe et appartient à l'utilisateur
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      sendError(res, 'Conversation non trouvée', 404);
      return;
    }

    // Vérifier les droits (créateur ou membre de l'organisation)
    const orgId = req.tenant?.type === 'organization' ? req.tenant.organizationId : null;
    if (conversation.creatorId !== userId && conversation.organizationId !== orgId) {
      sendError(res, 'Non autorisé à supprimer cette conversation', 403);
      return;
    }

    // Transaction: Supprimer messages + conversation atomiquement
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { conversationId: id } }),
      prisma.conversation.delete({ where: { id } }),
    ]);

    logger.info(`Conversation ${id} supprimée par l'utilisateur ${userId}`);
    sendSuccess(res, { deleted: true });
  } catch (error) {
    logger.error('Erreur deleteConversation:', error);
    sendError(res, 'Erreur lors de la suppression', 500);
  }
}

/**
 * Envoyer un message avec streaming SSE
 * Améliore l'UX en affichant la réponse au fur et à mesure
 */
export async function sendMessageStreaming(req: Request, res: Response): Promise<void> {
  try {
    const { content, conversationId } = req.body;
    const userId = req.user?.id;
    const userName = req.user?.firstName;

    if (!userId) {
      sendError(res, 'Non autorisé', 401);
      return;
    }

    const orgId = req.tenant?.type === 'organization' ? req.tenant.organizationId : null;

    // Configurer les headers SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx

    // Créer ou récupérer la conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 10 } },
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          creatorId: userId,
          organizationId: orgId,
          title: content.substring(0, 50),
        },
        include: { messages: true },
      });
    }

    // Sauvegarder le message utilisateur
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        authorId: userId,
        role: 'USER',
        content,
      },
    });

    // Envoyer l'ID de conversation au client
    res.write(`data: ${JSON.stringify({ type: 'conversation', conversationId: conversation.id })}\n\n`);

    // Préparer l'historique pour le streaming
    const previousMessages = conversation.messages.map((m) => ({
      role: m.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    let fullContent = '';
    let citations: CitationJson[] = [];
    let metadata: { tokensUsed?: number; responseTime?: number } = {};

    // Streamer la réponse
    for await (const event of generateChatResponseStream(content, previousMessages, userName || undefined)) {
      switch (event.type) {
        case 'start':
          res.write(`data: ${JSON.stringify({ type: 'start' })}\n\n`);
          break;

        case 'chunk':
          fullContent += event.content || '';
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: event.content })}\n\n`);
          break;

        case 'citations':
          citations = (event.citations || []).map(c => ({
            articleNumber: c.articleNumber,
            titre: c.titre,
            excerpt: c.excerpt,
            score: c.score,
          }));
          res.write(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`);
          break;

        case 'done':
          metadata = event.metadata || {};
          break;

        case 'error':
          res.write(`data: ${JSON.stringify({ type: 'error', error: event.error })}\n\n`);
          res.end();
          return;
      }
    }

    // Sauvegarder la réponse assistant en DB
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: fullContent,
        citations: JSON.parse(JSON.stringify(citations)),
        responseTime: metadata.responseTime,
        tokensUsed: metadata.tokensUsed,
      },
    });

    // Envoyer l'événement de fin
    res.write(`data: ${JSON.stringify({ type: 'done', metadata })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();

    logger.info(`[Streaming] Message traité pour conversation ${conversation.id}`);
  } catch (error) {
    logger.error('Erreur sendMessageStreaming:', error);

    // Si les headers n'ont pas encore été envoyés
    if (!res.headersSent) {
      sendError(res, 'Erreur lors du streaming', 500);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Erreur serveur' })}\n\n`);
      res.end();
    }
  }
}
