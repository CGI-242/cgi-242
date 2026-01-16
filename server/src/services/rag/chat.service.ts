// server/src/services/rag/chat.service.ts
// Service de chat avec IA pour les questions fiscales CGI 242

import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import https from 'https';
import { config } from '../../config/environment.js';
import { createLogger } from '../../utils/logger.js';
import { createAnthropicCall } from '../../utils/api-resilience.js';
import { hybridSearch, SearchResult } from './hybrid-search.service.js';
import { buildSimplePrompt, buildContextPrompt } from './chat.prompts.js';
import { isFiscalQuery, buildContext, extractArticlesFromResponse, Citation } from './chat.utils.js';

const logger = createLogger('ChatService');

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  timeout: 60000,
});

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
  timeout: 60000,
  maxRetries: 3,
  fetch: globalThis.fetch,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  content: string;
  citations: Citation[];
  tokensUsed: number;
  responseTime: number;
  model: string;
}

export interface StreamEvent {
  type: 'start' | 'chunk' | 'citations' | 'done' | 'error';
  content?: string;
  citations?: Citation[];
  cgiVersion?: string;
  metadata?: {
    tokensUsed?: number;
    responseTime?: number;
    model?: string;
    cgiVersion?: string;
  };
  error?: string;
}

export { Citation };

/**
 * Génère une réponse basée sur le contexte CGI avec Claude Haiku
 */
export async function generateChatResponse(
  query: string,
  conversationHistory: ChatMessage[] = [],
  userName?: string
): Promise<ChatResponse> {
  const startTime = Date.now();
  const isFiscal = isFiscalQuery(query);
  let searchResults: SearchResult[] = [];
  let systemPrompt = buildSimplePrompt(userName);

  if (isFiscal) {
    searchResults = await hybridSearch(query, 10, '2026');
    logger.info(`Articles trouvés: ${searchResults.map(r => `${r.payload.numero}(${r.matchType})`).join(', ')}`);
    const context = buildContext(searchResults);
    systemPrompt = buildContextPrompt(context);
  }

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: query },
  ];

  const completion = await createAnthropicCall(
    () => anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      system: systemPrompt,
      messages,
    }),
    30000
  );

  const responseTime = Date.now() - startTime;
  const content = completion.content[0]?.type === 'text' ? completion.content[0].text : '';
  const citations = isFiscal ? extractArticlesFromResponse(content, searchResults) : [];
  const tokensUsed = (completion.usage?.input_tokens || 0) + (completion.usage?.output_tokens || 0);

  logger.info(`Réponse générée en ${responseTime}ms (${tokensUsed} tokens, mode: ${isFiscal ? 'fiscal' : 'simple'})`);

  return { content, citations, tokensUsed, responseTime, model: 'claude-3-haiku' };
}

/**
 * Génère une réponse en streaming avec SSE
 */
export async function* generateChatResponseStream(
  query: string,
  conversationHistory: ChatMessage[] = [],
  userName?: string
): AsyncGenerator<StreamEvent> {
  const startTime = Date.now();

  try {
    const isFiscal = isFiscalQuery(query);
    let searchResults: SearchResult[] = [];

    yield { type: 'start' };

    let systemPrompt = buildSimplePrompt(userName);

    if (isFiscal) {
      searchResults = await hybridSearch(query, 10, '2026');
      logger.info(`[Streaming] Articles: ${searchResults.map(r => `${r.payload.numero}(${r.matchType})`).join(', ')}`);
      const context = buildContext(searchResults);
      systemPrompt = buildContextPrompt(context);
    }

    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: query },
    ];

    logger.info('[Streaming] Début appel API Anthropic');

    const response = await axios({
      method: 'POST',
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'x-api-key': config.anthropic.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      data: {
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        system: systemPrompt,
        messages,
        stream: true,
      },
      responseType: 'stream',
      timeout: 60000,
      httpsAgent,
    });

    logger.info('[Streaming] Connexion API établie');

    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;
    let buffer = '';

    for await (const chunk of response.data) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);
            if (event.type === 'content_block_delta' && event.delta?.text) {
              fullContent += event.delta.text;
              yield { type: 'chunk', content: event.delta.text };
            }
            if (event.type === 'message_delta' && event.usage) {
              outputTokens = event.usage.output_tokens;
            }
            if (event.type === 'message_start' && event.message?.usage) {
              inputTokens = event.message.usage.input_tokens;
            }
          } catch {
            // Ignorer les erreurs de parsing
          }
        }
      }
    }

    const citations = isFiscal ? extractArticlesFromResponse(fullContent, searchResults) : [];
    const cgiVersion = '2026';

    if (citations.length > 0) {
      yield { type: 'citations', citations, cgiVersion };
    }

    const responseTime = Date.now() - startTime;
    const tokensUsed = inputTokens + outputTokens;

    logger.info(`Streaming terminé en ${responseTime}ms (${tokensUsed} tokens)`);

    yield {
      type: 'done',
      metadata: { tokensUsed, responseTime, model: 'claude-3-haiku', cgiVersion },
    };
  } catch (error) {
    logger.error('Erreur streaming:', error);
    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

export default { generateChatResponse, generateChatResponseStream };
