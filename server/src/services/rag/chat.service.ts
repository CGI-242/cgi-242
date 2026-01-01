// server/src/services/rag/chat.service.ts
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/environment.js';
import { createLogger } from '../../utils/logger.js';
import { generateEmbedding } from './embeddings.service.js';
import { searchSimilarArticles, SearchResult } from './qdrant.service.js';

const logger = createLogger('ChatService');

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

const SYSTEM_PROMPT_WITH_CONTEXT = `Tu es CGI 242, assistant fiscal expert.

RÈGLES ABSOLUES:
1. Tu ne peux citer QUE les articles présents dans le CONTEXTE CGI ci-dessous
2. Si un article n'apparaît pas dans le contexte, NE LE CITE PAS
3. NE JAMAIS inventer de numéro d'article ou de règle fiscale
4. NE JAMAIS inventer ou modifier des chiffres, montants, taux ou seuils
5. CITE TEXTUELLEMENT les montants et taux tels qu'ils apparaissent
6. NE DIS JAMAIS "selon le contexte CGI" - utilise plutôt "selon le CGI" ou "le CGI dispose à son article X"

RÈGLES DE RÉPONSE:
1. Structure TOUJOURS ta réponse avec des sections claires
2. Cite les articles du CGI concernés (ex: "Art. 122")
3. Utilise des émojis pour la lisibilité (📌 💡 ⚠️)
4. Ajoute un conseil pratique quand pertinent
5. Sois professionnel mais accessible
6. Mets en **gras** les informations clés

FORMAT OBLIGATOIRE:
📋 [Réponse principale claire et directe]

📌 **Points importants**
- Point 1
- Point 2

💡 **Conseil pratique**
[Un conseil utile si applicable]

📖 **Référence** : Art. X, Art. Y du CGI`;


const SYSTEM_PROMPT_SIMPLE = `Tu es CGI 242, assistant fiscal expert.

STYLE:
- Professionnel mais accessible
- Utilise le prénom de l'utilisateur si disponible
- Réponds avec un émoji adapté
- Sois concis et pertinent

Si l'utilisateur te salue:
"👋 Bonjour [Prénom] ! Je suis CGI 242, votre assistant fiscal.
Comment puis-je vous aider ?"

Tu peux aider sur:
📊 Questions fiscales (IRPP, IS, TVA, etc.)
📖 Articles du CGI
⚖️ Analyse de redressements
🧮 Calculs fiscaux`;

// Mots-clés indiquant une question fiscale
const FISCAL_KEYWORDS = [
  'impôt', 'taxe', 'irpp', 'tva', 'bica', 'bnc', 'fiscal', 'contribuable',
  'déclaration', 'revenu', 'bénéfice', 'déduction', 'exonération', 'barème',
  'taux', 'article', 'cgi', 'payer', 'calculer', 'montant', 'base imposable',
  'charges', 'amortissement', 'plus-value', 'déficit', 'société', 'entreprise',
  'salaire', 'traitement', 'pension', 'dividende', 'loyer', 'foncier',
  'patente', 'licence', 'timbre', 'enregistrement', 'douane', 'droit',
  'recouvrement', 'contrôle', 'vérification', 'redressement', 'pénalité',
  'majoration', 'intérêt', 'délai', 'prescription', 'réclamation', 'contentieux',
  'parts', 'quotient', 'célibataire', 'marié', 'veuf', 'divorcé', 'enfant'
];


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

  // 5. Appeler Claude Haiku
  const completion = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2000,
    system: systemPrompt,
    messages,
  });

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

export default {
  generateChatResponse,
};
