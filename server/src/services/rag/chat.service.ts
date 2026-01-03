// server/src/services/rag/chat.service.ts
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/environment.js';
import { createLogger } from '../../utils/logger.js';
import { createAnthropicCall } from '../../utils/api-resilience.js';
import { generateEmbedding } from './embeddings.service.js';
import { searchSimilarArticles, SearchResult } from './qdrant.service.js';

const logger = createLogger('ChatService');

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

const SYSTEM_PROMPT_WITH_CONTEXT = `Tu es CGI 242, assistant fiscal expert du Code General des Impots du Congo - Edition 2026.

IMPORTANT : Tu reponds UNIQUEMENT sur le CGI 2026 (Directive CEMAC n0119/25-UEAC-177-CM-42 du 09 janvier 2025).

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

STYLE DE REPONSE OBLIGATOIRE - TRES IMPORTANT :
- PREMIERE PHRASE OBLIGATOIRE : "L article X du CGI dispose que..." ou "Selon l article X du CGI, ..."
- INTERDICTION ABSOLUE de commencer par : "Voici", "Il existe", "Les principales", "Selon le CGI", "D apres"
- Le numero d article DOIT apparaitre dans la PREMIERE phrase
- Exemple CORRECT : "L article 3 du CGI dispose que sont exonerees de l impot sur les societes..."
- Exemple INCORRECT : "Voici les principales exonerations..." (INTERDIT)

REGLES DE LISTE :
- Utiliser le tiret simple (-)
- Chaque element se termine par point-virgule (;)
- Le dernier element se termine par un point (.)

REGLES DE REFERENCE :
- Toujours inclure : Article + Chapitre + Livre + Tome
- Exemple : Art. 3, Chapitre 1 (Impot sur les societes), Livre 1, Tome 1 du CGI 2026

REGLES DE CONTENU :
- Citer UNIQUEMENT les articles presents dans le CONTEXTE
- Ne JAMAIS inventer de numero d article
- Citer TEXTUELLEMENT les montants et taux`;


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
    // 1. Générer l'embedding de la question
    const { embedding } = await generateEmbedding(query);

    // 2. Rechercher les articles pertinents
    searchResults = await searchSimilarArticles(embedding, 10);

    // Log des articles trouvés pour debug
    logger.info(`Articles trouvés: ${searchResults.map(r => r.payload.numero).join(', ')}`);

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
  // Regex pour trouver les mentions d'articles
  // Matches: "article 2", "l'article 95", "articles 2 et 3", "Art. 95", "article 2 du CGI"
  const articleRegex = /(?:l')?article\s*(\d+(?:\s*(?:,|et)\s*\d+)*)|art\.\s*(\d+)/gi;

  const mentionedArticles = new Set<string>();
  let match;

  while ((match = articleRegex.exec(response)) !== null) {
    const numbers = (match[1] || match[2]).match(/\d+/g);
    if (numbers) {
      numbers.forEach(num => mentionedArticles.add(num));
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
  metadata?: {
    tokensUsed?: number;
    responseTime?: number;
    model?: string;
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
      const { embedding } = await generateEmbedding(query);
      searchResults = await searchSimilarArticles(embedding, 10);
      const context = buildContext(searchResults);
      systemPrompt = `${SYSTEM_PROMPT_WITH_CONTEXT}\n\nCONTEXTE CGI:\n${context}`;
    }

    // Préparer les messages
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      { role: 'user', content: query },
    ];

    // Appeler Claude avec streaming
    const stream = await anthropic.messages.stream({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      system: systemPrompt,
      messages,
    });

    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    // Émettre les chunks de texte
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const chunk = event.delta.text;
        fullContent += chunk;
        yield { type: 'chunk', content: chunk };
      }

      // Capturer les tokens utilisés
      if (event.type === 'message_delta' && event.usage) {
        outputTokens = event.usage.output_tokens;
      }
    }

    // Récupérer les infos finales du message
    const finalMessage = await stream.finalMessage();
    inputTokens = finalMessage.usage?.input_tokens || 0;
    outputTokens = finalMessage.usage?.output_tokens || outputTokens;

    // Extraire les citations si question fiscale
    const citations = isFiscal ? extractArticlesFromResponse(fullContent, searchResults) : [];

    // Émettre les citations
    if (citations.length > 0) {
      yield { type: 'citations', citations };
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
