// server/src/services/rag/chat.service.ts
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import https from 'https';
import { config } from '../../config/environment.js';
import { createLogger } from '../../utils/logger.js';
import { createAnthropicCall } from '../../utils/api-resilience.js';
import { hybridSearch, SearchResult as HybridSearchResult } from './hybrid-search.service.js';

// Alias pour compatibilité
type SearchResult = HybridSearchResult;

const logger = createLogger('ChatService');

// Agent HTTPS avec keep-alive pour stabilité connexion
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  timeout: 60000,
});

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
  timeout: 60000, // 60 secondes
  maxRetries: 3,
  fetch: globalThis.fetch, // Utiliser fetch natif Node.js
});

const SYSTEM_PROMPT_WITH_CONTEXT = `Tu es CGI 242, assistant fiscal expert du Code General des Impots du Congo - Edition 2026.

IMPORTANT : Tu reponds UNIQUEMENT sur le CGI 2026.

REGLES DE FORMAT - PRIORITE MAXIMALE :
Tu dois IMPERATIVEMENT respecter ces regles de format. Toute violation est inacceptable.

INTERDICTIONS ABSOLUES :
- PAS de ** (double asterisque)
- PAS de * (asterisque simple)
- PAS de gras
- PAS d italique
- PAS de markdown
- PAS d emoji (pas de symboles comme check, fleche, etoile, etc.)
- PAS de caracteres speciaux decoratifs

FORMAT DE REPONSE EXACT A SUIVRE :

L article X du CGI dispose que [reponse directe ici].

Points importants :
- Premier point ;
- Deuxieme point ;
- Dernier point.

Conseil pratique :
[conseil ici]

Reference : Art. X, Chapitre Y, Livre Z, Tome T du CGI 2026

STYLE DE REPONSE - OBLIGATOIRE :
- PREMIERE PHRASE : "L article X du CGI dispose que..."
- INTERDIT de commencer par : "Voici", "Selon", "Il existe", "Les principales", "D apres"
- Exemple CORRECT : "L article 3 du CGI dispose que sont exonerees de l impot sur les societes les entites suivantes :"
- Exemple INCORRECT : "Selon l article 3..." ou "Voici les exonerations..." (INTERDIT)

REGLES DE LISTE - TRES IMPORTANT :
- JAMAIS de numeros (1. 2. 3.) - utiliser UNIQUEMENT le tiret (-)
- Chaque element se termine par point-virgule (;)
- Le dernier element se termine par un point (.)
- Citer TOUS les points de l article, pas seulement quelques-uns

REGLES DE REFERENCE :
- Toujours inclure : Article + Chapitre + Livre + Tome
- Exemple : Art. 3, Chapitre 1 (Impot sur les societes), Livre 1, Tome 1 du CGI 2026

REGLES DE CONTENU :
- Citer UNIQUEMENT les articles presents dans le CONTEXTE
- Ne JAMAIS inventer de numero d article
- Citer TEXTUELLEMENT les montants et taux

SI AUCUN ARTICLE PERTINENT :
Reponds simplement : "Veuillez poser une question sur le CGI 2026."`;


const SYSTEM_PROMPT_SIMPLE = `Tu es CGI 242, assistant fiscal expert du Code General des Impots du Congo.

STYLE:
- Professionnel mais accessible
- Utilise le prenom de l utilisateur si disponible
- Sois concis et pertinent
- PAS d emoji
- PAS de ** ou markdown

Si l utilisateur te salue:
"Bonjour [Prenom] ! Je suis CGI 242, votre assistant fiscal. Comment puis-je vous aider ?"

Tu peux aider sur:
- Questions fiscales (IRPP, IS, TVA, etc.) ;
- Articles du CGI ;
- Analyse de redressements ;
- Calculs fiscaux.`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Citation {
  articleNumber: string;
  titre?: string;
  excerpt: string;
  score: number;
}

export interface ChatResponse {
  content: string;
  citations: Citation[];
  tokensUsed: number;
  responseTime: number;
  model: string;
}

/**
 * Détecte si la requête est une simple salutation (pas besoin de recherche)
 */
function isSimpleGreeting(query: string): boolean {
  const lowerQuery = query.toLowerCase().trim();

  // Salutations simples
  const greetings = ['bonjour', 'salut', 'hello', 'hi', 'bonsoir', 'coucou', 'hey', 'merci', 'au revoir', 'bye'];

  // Si le message est court et commence par une salutation
  if (lowerQuery.length < 20) {
    return greetings.some(g => lowerQuery.startsWith(g));
  }

  return false;
}

/**
 * Détecte si la requête nécessite une recherche dans le CGI
 */
function isFiscalQuery(query: string): boolean {
  // Si c'est une simple salutation, pas besoin de recherche
  if (isSimpleGreeting(query)) {
    return false;
  }

  // Pour toute autre question, faire la recherche
  return true;
}


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
  let context = '';

  // Ajouter le nom de l'utilisateur au prompt simple
  let systemPrompt = userName
    ? `${SYSTEM_PROMPT_SIMPLE}\n\nLe prénom de l'utilisateur est: ${userName}`
    : SYSTEM_PROMPT_SIMPLE;

  // Ne faire la recherche que pour les questions fiscales
  if (isFiscal) {
    // Recherche hybride (keywords + vectorielle) avec métadonnées CGI 2026
    searchResults = await hybridSearch(query, 10, '2026');

    // Log des articles trouvés pour debug
    logger.info(`Articles trouvés (hybride): ${searchResults.map(r => `${r.payload.numero}(${r.matchType})`).join(', ')}`);

    // Log du contenu pour debug (premiers 300 chars de chaque article)
    searchResults.forEach(r => {
      logger.debug(`${r.payload.numero}: ${r.payload.contenu.substring(0, 300)}...`);
    });

    // 3. Construire le contexte
    context = buildContext(searchResults);

    // 4. Utiliser le prompt avec contexte CGI
    systemPrompt = `${SYSTEM_PROMPT_WITH_CONTEXT}\n\nCONTEXTE CGI:\n${context}`;
  }

  // 4. Préparer les messages pour Claude
  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    { role: 'user', content: query },
  ];

  // 5. Appeler Claude Haiku avec timeout (30s) et retry (3 tentatives)
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
  const content = completion.content[0]?.type === 'text'
    ? completion.content[0].text
    : '';

  // 6. Extraire les articles mentionnés dans la réponse
  const citations = isFiscal ? extractArticlesFromResponse(content, searchResults) : [];

  const tokensUsed = (completion.usage?.input_tokens || 0) + (completion.usage?.output_tokens || 0);

  logger.info(`Réponse générée en ${responseTime}ms (${tokensUsed} tokens, mode: ${isFiscal ? 'fiscal' : 'simple'})`);

  return {
    content,
    citations,
    tokensUsed,
    responseTime,
    model: 'claude-3-haiku',
  };
}

function buildContext(results: SearchResult[]): string {
  return results
    .map(r => {
      const { numero, titre, contenu, tome, chapitre } = r.payload;
      let header = `${numero}`;
      if (titre) header += ` - ${titre}`;
      if (tome) header += ` (${tome}`;
      if (chapitre) header += `, ${chapitre}`;
      if (tome) header += ')';

      // Augmenté à 2000 caractères pour ne pas tronquer les barèmes et tableaux
      return `${header}\n${contenu.substring(0, 2000)}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Extrait les numéros d'articles mentionnés dans la réponse de Claude
 */
function extractArticlesFromResponse(response: string, searchResults: SearchResult[]): Citation[] {
  // Regex pour trouver les mentions d'articles (supporte 4A, 44 A, 86C, etc.)
  // Matches: "article 2", "l'article 4A", "articles 2 et 3", "Art. 95", "article 44 A"
  const articleRegex = /(?:l')?article\s*(\d+\s*[A-Z]?(?:\s*(?:,|et)\s*\d+\s*[A-Z]?)*)|art\.\s*(\d+\s*[A-Z]?)/gi;

  const mentionedArticles = new Set<string>();
  let match;

  while ((match = articleRegex.exec(response)) !== null) {
    // Extraire les numéros avec leur lettre optionnelle
    const articleNumbers = (match[1] || match[2]).match(/\d+\s*[A-Z]?/gi);
    if (articleNumbers) {
      articleNumbers.forEach(num => {
        // Normaliser: "4 A" -> "4A", "44 A" -> "44 A"
        const normalized = num.replace(/\s+/g, ' ').trim().toUpperCase();
        mentionedArticles.add(normalized);
      });
    }
  }

  // Si aucun article trouvé dans la réponse, retourner vide
  if (mentionedArticles.size === 0) {
    return [];
  }

  // Créer les citations pour les articles mentionnés
  const citations: Citation[] = [];

  mentionedArticles.forEach(articleNum => {
    // Chercher dans les résultats de recherche
    const found = searchResults.find(r =>
      r.payload.numero.includes(articleNum) ||
      r.payload.numero === `Art. ${articleNum}` ||
      r.payload.numero === `Article ${articleNum}`
    );

    if (found) {
      citations.push({
        articleNumber: `Art. ${articleNum}`,
        titre: found.payload.titre,
        excerpt: found.payload.contenu.substring(0, 200) + '...',
        score: found.score,
      });
    } else {
      // Article mentionné mais pas dans les résultats de recherche
      citations.push({
        articleNumber: `Art. ${articleNum}`,
        excerpt: '',
        score: 0,
      });
    }
  });

  // Trier par numéro d'article
  return citations.sort((a, b) => {
    const numA = parseInt(a.articleNumber.replace(/\D/g, ''));
    const numB = parseInt(b.articleNumber.replace(/\D/g, ''));
    return numA - numB;
  });
}

/**
 * Interface pour les événements SSE
 */
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

/**
 * Génère une réponse en streaming avec SSE
 * Améliore l'UX en affichant la réponse au fur et à mesure
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

    // Émettre le début du stream
    yield { type: 'start' };

    // Préparer le système prompt
    let systemPrompt = userName
      ? `${SYSTEM_PROMPT_SIMPLE}\n\nLe prénom de l'utilisateur est: ${userName}`
      : SYSTEM_PROMPT_SIMPLE;

    // Recherche pour les questions fiscales
    if (isFiscal) {
      // Recherche hybride (keywords + vectorielle) avec métadonnées CGI 2026
      searchResults = await hybridSearch(query, 10, '2026');
      logger.info(`[Streaming] Articles trouvés (hybride): ${searchResults.map(r => `${r.payload.numero}(${r.matchType})`).join(', ')}`);
      const context = buildContext(searchResults);
      systemPrompt = `${SYSTEM_PROMPT_WITH_CONTEXT}\n\nCONTEXTE CGI:\n${context}`;
    }

    // Préparer les messages avec prefill pour forcer le format
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      { role: 'user', content: query },
    ];

    // Utiliser axios pour le streaming (contourne bug SDK et fetch natif)
    logger.info('[Streaming] Début appel API Anthropic');
    logger.debug('[Streaming] Messages:', JSON.stringify(messages.slice(-2)));

    let response;
    try {
      response = await axios({
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
      logger.info('[Streaming] Connexion API établie, status:', response.status);
    } catch (axiosError) {
      const err = axiosError as Error & { code?: string; response?: { status?: number; data?: { toString?: () => string } } };
      logger.error('[Streaming] Erreur axios:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data?.toString?.()?.slice(0, 500),
      });
      throw axiosError;
    }

    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    // Parser le stream SSE avec axios
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

    // Extraire les citations si question fiscale
    const citations = isFiscal ? extractArticlesFromResponse(fullContent, searchResults) : [];

    // Version du CGI utilisée
    const cgiVersion = '2026';

    // Émettre les citations avec la version
    if (citations.length > 0) {
      yield { type: 'citations', citations, cgiVersion };
    }

    const responseTime = Date.now() - startTime;
    const tokensUsed = inputTokens + outputTokens;

    logger.info(`Streaming terminé en ${responseTime}ms (${tokensUsed} tokens)`);

    // Émettre la fin avec métadonnées
    yield {
      type: 'done',
      metadata: {
        tokensUsed,
        responseTime,
        model: 'claude-3-haiku',
        cgiVersion,
      },
    };
  } catch (error) {
    logger.error('Erreur streaming:', error);
    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

export default {
  generateChatResponse,
  generateChatResponseStream,
};
