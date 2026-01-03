// server/src/agents/cgi-agent.ts
// Agent CGI unique - Version en vigueur (2026)
import { BaseAgent, AgentConfig, AgentContext, AgentResponse, ArticleSource, AgentMetadata } from './base-agent.js';
import { hybridSearch } from '../services/rag/hybrid-search.service.js';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';
import { createAnthropicCall } from '../utils/api-resilience.js';

const logger = createLogger('CGIAgent');

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

const SYSTEM_PROMPT = `Tu es CGI 242, assistant fiscal expert du Code Général des Impôts du Congo - Edition 2026.

IMPORTANT : Tu reponds UNIQUEMENT sur le CGI 2026 (Directive CEMAC n°0119/25-UEAC-177-CM-42 du 09 janvier 2025).
Tu ne reponds PAS sur les editions anterieures (2025 ou avant).

Tu réponds aux questions fiscales en te basant UNIQUEMENT sur les articles du CGI 2026 fournis dans le contexte.

RÈGLES ABSOLUES:
1. Tu ne peux citer QUE les articles présents dans le CONTEXTE CGI ci-dessous
2. Si un article n'apparaît pas dans le contexte, NE LE CITE PAS
3. NE JAMAIS inventer de numéro d'article ou de règle fiscale
4. NE JAMAIS inventer ou modifier des chiffres, montants, taux ou seuils
5. CITE TEXTUELLEMENT les montants et taux tels qu'ils apparaissent

RÈGLES DE RÉPONSE:
1. Structure TOUJOURS ta réponse avec des sections claires
2. Cite les articles du CGI concernés avec le format : "Art. X du CGI"
3. Ajoute un conseil pratique quand pertinent
4. Sois professionnel mais accessible

FORMAT OBLIGATOIRE (sans gras ni emojis) :
[Reponse principale claire et directe]

Points importants :
- Premier point ;
- Deuxieme point ;
- Dernier point.

Conseil pratique :
[Un conseil utile si applicable]

Reference : Art. X, Art. Y du CGI

REGLES DE FORMAT STRICTES :
- JAMAIS utiliser ** ou * pour le gras ou italique ;
- Chaque element d'une liste DOIT se terminer par un point-virgule (;) ;
- Le dernier element d'une liste se termine par un point (.) ;
- Pas d'emojis ;
- Ecrire les sigles en entier la premiere fois ;
- Utiliser des tirets (-) pour les listes, pas de puces speciales.

Exemple CORRECT de liste :
1. Revenus fonciers ;
2. Bénéfices des activités industrielles ;
3. Traitements et salaires.

=== BARÈME ITS (Art. 116) ===
L'ITS (Impot sur les Traitements et Salaires) :
1. De 0 a 615 000 FCFA : forfait 1 200 FCFA (impot minimum annuel) ;
2. De 615 001 a 1 500 000 FCFA : 10% ;
3. De 1 500 001 a 3 500 000 FCFA : 15% ;
4. De 3 500 001 a 5 000 000 FCFA : 20% ;
5. Au-dela de 5 000 001 FCFA : 30%.
Note : Pas de reduction pour charge de famille. Retenue mensuelle a la source par l'employeur.

=== AVANTAGES EN NATURE ITS (Art. 115) ===
1. Logement : 20% du salaire plafonne securite sociale ;
2. Nourriture : 20% du salaire brut ;
3. Domesticite ou Gardiennage : 7% du salaire brut chacun ;
4. Eau, Eclairage, Gaz : 5% du salaire brut chacun ;
5. Voiture : 3% du salaire brut ;
6. Telephone : 2% du salaire brut.

=== IBA - Impot sur les Benefices d'Affaires (Art. 93-104) ===
Taux : 30% (Art. 95). Minimum de perception : 1,5% des produits (exploitation + financiers + HAO). Regime forfait : CA inferieur au seuil TVA (Art. 96). Amortissement lineaire uniquement, report deficitaire 3 ans max.

=== IRCM - Impot sur le Revenu des Capitaux Mobiliers (Art. 105-110A) ===
Taux : 15% (35% revenus occultes). Dividendes, interets, plus-values mobilieres.

=== IRF - Impot sur les Revenus Fonciers (Art. 111-113A) ===
Taux loyers : 9%. Taux plus-values immobilieres : 15%. Retenue a la source par locataire (personnes morales IS, IBA, Etat).

=== IS - Impot sur les Societes (CGI 2026) ===
Exonerations IS (Art. 3) :
- BEAC et BDEAC ;
- Cooperatives agricoles de production, transformation, conservation et vente ;
- Caisses de credit agricole mutuel ;
- Associations sans but lucratif (foires, expositions, manifestations sportives) ;
- Collectivites locales et leurs regies de services publics ;
- Organismes reconnus d'utilite publique charges du developpement rural ;
- Groupements d'interet economique (GIE) ;
- Societes civiles professionnelles ;
- Centres de gestion agrees ;
- Entreprises d'exploitation agricole (agriculture, peche, elevage).
IMPORTANT : A compter du 1er janvier 2026, les exonerations conventionnelles d'IS ne peuvent etre octroyees ni renouvelees (Art. 3).
Credit d'impot investissement (Art. 3A) : maximum 15%, reportable 5 ans, non remboursable.
Taux IS (Art. 86A) : 25% (33% pour non-residents CEMAC).
Minimum de perception (Art. 86B) : 1% (ou 2% si deficit fiscal 2 exercices consecutifs) sur produits exploitation + financiers + HAO.
Acomptes IS : 15 fevrier, 15 mai, 15 aout, 15 novembre.
Acomptes minimum perception : 15 mars, 15 juin, 15 septembre, 15 decembre.
Retenue source non-residents (Art. 86C) : 20% sur prestations et redevances.
Report deficitaire (Art. 75) : 5 ans maximum.
Personnes morales etrangeres (Art. 92 a 92K) : regime forfaitaire 22%, quitus fiscal, sous-traitants petroliers.

Base juridique : Directive n°0119/25-UEAC-177-CM-42 du 09 janvier 2025
Base de connaissances : CGI - République du Congo`;

const agentConfig: AgentConfig = {
  name: 'Agent CGI',
  version: 'current',
  validFrom: '2026-01-01',
  validUntil: null, // En cours de validité
  knowledgeBasePath: 'data/cgi/2026',
  systemPrompt: SYSTEM_PROMPT,
};

/**
 * Agent CGI unique - Version en vigueur
 */
export class CGIAgent extends BaseAgent {
  constructor() {
    super(agentConfig);
  }

  /**
   * Détecte si la question porte sur des valeurs numériques
   */
  private isNumericQuestion(query: string): boolean {
    const numericPatterns = [
      /combien/i,
      /quel(?:le)?s?\s+(?:est|sont|délai|durée|taux|montant|seuil)/i,
      /pendant\s+combien/i,
      /au bout de/i,
      /après\s+combien/i,
      /délai|durée|période/i,
      /taux|pourcentage|%/i,
      /montant|seuil|plafond/i,
      /\d+\s*(mois|ans?|jours?)/i,
      /barème|bareme|tranche/i,
    ];
    return numericPatterns.some((p) => p.test(query));
  }

  /**
   * Extrait les passages clés contenant des valeurs numériques
   */
  private extractKeyPassagesArray(fullText: string): string[] {
    const sentences = fullText
      .replace(/(\d)\.\s+(\d)/g, '$1§DECIMAL§$2')
      .replace(/Art\.\s+/g, 'Art§DOT§ ')
      .split(/[.;]\s+/)
      .map((s) =>
        s
          .replace(/§DECIMAL§/g, '.')
          .replace(/§DOT§/g, '.')
          .trim()
      )
      .filter((s) => s.length > 10);

    const keyPatterns = [
      /\d+\s*%/,
      /\d+[\s.]*\d*\s*(FCFA|francs)/i,
      /vingt|trente|quarante|cinquante|soixante/i,
      /\d+\s*(mois|ans?|jours?|heures?)/i,
      /délai|durée|période|absence/i,
      /taux|barème|seuil|plafond|minimum/i,
      /exonér|affranchi|exempté/i,
      /retenue|acompte|versement/i,
    ];

    const keyPassages = sentences.filter((sentence) =>
      keyPatterns.some((pattern) => pattern.test(sentence))
    );

    return keyPassages.slice(0, 5);
  }

  /**
   * Traite une requête utilisateur
   */
  async process(query: string, context?: AgentContext): Promise<AgentResponse> {
    const startTime = Date.now();
    logger.info(`[CGIAgent] Traitement: "${query.substring(0, 100)}..."`);

    try {
      // 1. Recherche hybride dans la base de connaissances (8 articles)
      const sources = await this.searchKnowledgeBase(query, 8);

      logger.info(`[CGIAgent] Articles consultés:`, {
        count: sources.length,
        articles: sources.map((s) => ({
          numero: s.numero,
          titre: s.titre,
        })),
      });

      // 2. Détecter si question numérique
      const isNumeric = this.isNumericQuestion(query);
      logger.info(`[CGIAgent] Question numérique: ${isNumeric}`);

      // 3. Construire le contexte avec les articles trouvés (sans formatage markdown)
      const articlesContext = sources
        .slice(0, 6)
        .map((s) => {
          const header = `Art. ${s.numero} (CGI)${s.titre ? ` - ${s.titre}` : ''}`;
          const keyPassagesSection =
            s.keyPassages && s.keyPassages.length > 0
              ? `\nInformations cles :\n${s.keyPassages.map((p) => `- ${p} ;`).join('\n')}\n`
              : '';
          return `---\n${header}\n${keyPassagesSection}\nTexte :\n${s.extrait}`;
        })
        .join('\n\n');

      // 4. Préparer le système prompt avec contexte
      const numericInstruction = isNumeric
        ? `\n\n## INSTRUCTION SPÉCIALE - EXTRACTION NUMÉRIQUE
Cette question porte sur une VALEUR NUMÉRIQUE (délai, durée, taux, montant).
Tu DOIS :
1. Scanner le contexte pour trouver les CHIFFRES ou NOMBRES EN LETTRES
2. Chercher : pourcentages (%), durées (mois, ans, jours), montants (FCFA, francs)
3. CITER EXACTEMENT le passage contenant la valeur numérique`
        : '';

      const systemPromptWithContext = `${this.getSystemPrompt()}${numericInstruction}\n\nCONTEXTE CGI:\n${articlesContext || 'Aucun article trouvé.'}`;

      // 5. Préparer les messages pour Claude
      const messages: Anthropic.MessageParam[] = [
        ...(context?.previousMessages || [])
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        { role: 'user', content: query },
      ];

      // 6. Appeler Claude Haiku avec timeout (30s) et retry (3 tentatives)
      const completion = await createAnthropicCall(
        () => anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2000,
          system: systemPromptWithContext,
          messages,
          temperature: 0,
        }),
        30000
      );

      const answer =
        completion.content[0]?.type === 'text' ? completion.content[0].text : '';

      logger.info(`[CGIAgent] Réponse générée en ${Date.now() - startTime}ms`);
      logger.info(`[CGIAgent] Articles trouvés:`, sources.map((s) => s.numero));

      // Metadata pour traçabilité
      const metadata: AgentMetadata = {
        articlesConsulted: sources.map((s) => s.numero),
        queryTime: Date.now() - startTime,
        model: 'claude-3-haiku-20240307',
        temperature: 0,
      };

      return this.buildResponse(answer, sources, startTime, metadata);
    } catch (error) {
      logger.error('[CGIAgent] Erreur:', error);
      throw error;
    }
  }

  /**
   * Recherche hybride dans la base de connaissances CGI
   */
  async searchKnowledgeBase(query: string, limit = 8): Promise<ArticleSource[]> {
    try {
      // Utiliser la recherche hybride avec collection CGI 2026
      const searchResults = await hybridSearch(query, limit, '2026');

      // Convertir en ArticleSource avec extraction des passages clés
      const sources: ArticleSource[] = searchResults.map((result) => {
        const fullContent = result.payload.contenu;
        const keyPassages = this.extractKeyPassagesArray(fullContent);
        const truncatedContent =
          fullContent.length > 1000
            ? fullContent.substring(0, 1000) + '...'
            : fullContent;

        return {
          numero: result.payload.numero,
          titre: result.payload.titre,
          extrait: truncatedContent,
          keyPassages: keyPassages,
          fullContentLength: fullContent.length,
          version: 'current',
          score: result.score,
          matchType: result.matchType,
        };
      });

      logger.info(
        `[CGIAgent] Recherche hybride: ${searchResults.map((r) => `${r.payload.numero}(${r.matchType})`).join(', ')}`
      );

      return sources;
    } catch (error) {
      logger.error('[CGIAgent] Erreur recherche hybride:', error);
      return [];
    }
  }
}

// Export singleton
export const cgiAgent = new CGIAgent();
export default CGIAgent;
