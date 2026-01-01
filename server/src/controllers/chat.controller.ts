// server/src/controllers/chat.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { orchestrator } from '../orchestrator/index.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { createLogger } from '../utils/logger.js';

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
 * Envoyer un message avec l'orchestrateur multi-agent (2025/2026)
 * Analyse l'intention et route vers le bon agent
 */
export async function sendMessageOrchestrated(req: Request, res: Response): Promise<void> {
  try {
    const { content, conversationId, forceYear } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, 'Non autorisé', 401);
      return;
    }

    // Récupérer ou créer la conversation
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
          organizationId: req.tenant?.type === 'organization' ? req.tenant.organizationId : null,
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

    // Utiliser l'orchestrateur pour router la requête
    let orchestratorResponse;

    if (forceYear && (forceYear === 2025 || forceYear === 2026)) {
      // Forcer un agent spécifique
      const agentResponse = await orchestrator.queryWithAgent(content, forceYear, agentContext);
      orchestratorResponse = {
        answer: agentResponse.answer,
        sources: agentResponse.sources,
        routing: {
          intent: { targetYear: forceYear, isComparison: false, domain: null, confidence: 1, detectedKeywords: [] },
          agentsUsed: [agentResponse.agentUsed],
          isComparison: false,
        },
        processingTime: agentResponse.processingTime,
      };
    } else {
      // Laisser l'orchestrateur décider
      orchestratorResponse = await orchestrator.processQuery(content, agentContext);
    }

    // Convertir les sources en citations
    const citations: CitationJson[] = orchestratorResponse.sources.map((s) => ({
      articleNumber: s.numero,
      titre: s.titre,
      excerpt: s.extrait,
      score: 0.8,
    }));

    // Sauvegarder la réponse
    const assistantMessage = await prisma.message.create({
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
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { title: content.substring(0, 50) },
      });
    }

    // Récupérer la conversation mise à jour
    const updatedConversation = await prisma.conversation.findUnique({
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

    logger.info(
      `[Orchestrator] Message traité - Agents: ${orchestratorResponse.routing.agentsUsed.join(', ')}, ` +
        `Comparison: ${orchestratorResponse.routing.isComparison}, Time: ${orchestratorResponse.processingTime}ms`
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
