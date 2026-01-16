// server/src/controllers/chat.streaming.controller.ts
// Contrôleur de streaming SSE pour le chat

import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { sendError } from '../utils/helpers.js';
import { createLogger } from '../utils/logger.js';
import { generateChatResponseStream } from '../services/rag/chat.service.js';

interface CitationJson {
  articleNumber: string;
  titre?: string;
  excerpt: string;
  score: number;
}

const logger = createLogger('ChatStreamingController');

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
    res.setHeader('X-Accel-Buffering', 'no');

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

    if (!res.headersSent) {
      sendError(res, 'Erreur lors du streaming', 500);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Erreur serveur' })}\n\n`);
      res.end();
    }
  }
}
