// server/src/orchestrator/comparison.ts
import { createLogger } from '../utils/logger.js';
import { AgentResponse, ArticleSource } from '../agents/base-agent.js';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/environment.js';

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

const logger = createLogger('ComparisonHandler');

export interface ComparisonSection {
  aspect: string;
  cgi2025: string;
  cgi2026: string;
  impact: 'favorable' | 'defavorable' | 'neutre';
}

export interface DetailedComparison {
  summary: string;
  sections: ComparisonSection[];
  recommendation: string;
  sources: {
    cgi2025: ArticleSource[];
    cgi2026: ArticleSource[];
  };
}

/**
 * Gestionnaire spécialisé pour les comparaisons entre CGI 2025 et 2026
 */
export class ComparisonHandler {
  /**
   * Génère une comparaison détaillée pour un domaine fiscal spécifique
   */
  async generateDetailedComparison(
    domain: string,
    response2025: AgentResponse,
    response2026: AgentResponse
  ): Promise<DetailedComparison> {
    logger.info(`[ComparisonHandler] Comparaison détaillée pour: ${domain}`);

    const comparisonPrompt = `Analyse comparative détaillée pour le domaine: ${domain}

=== CGI 2025 ===
${response2025.answer}

=== CGI 2026 ===
${response2026.answer}

Génère une réponse JSON avec cette structure exacte:
{
  "summary": "Résumé en 2-3 phrases des changements majeurs",
  "sections": [
    {
      "aspect": "Nom de l'aspect comparé",
      "cgi2025": "Description 2025",
      "cgi2026": "Description 2026",
      "impact": "favorable|defavorable|neutre"
    }
  ],
  "recommendation": "Recommandation pratique pour le contribuable"
}

IMPORTANT: Retourne UNIQUEMENT le JSON, sans texte additionnel.`;

    const systemPrompt =
      'Tu es un expert fiscal. Tu dois analyser les différences entre les régimes fiscaux et retourner une réponse JSON structurée.';

    try {
      const completion = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: comparisonPrompt }],
      });

      const jsonResponse = completion.content[0]?.type === 'text' ? completion.content[0].text : '{}';
      const parsed = JSON.parse(jsonResponse);

      return {
        summary: parsed.summary || '',
        sections: parsed.sections || [],
        recommendation: parsed.recommendation || '',
        sources: {
          cgi2025: response2025.sources,
          cgi2026: response2026.sources,
        },
      };
    } catch (error) {
      logger.error('[ComparisonHandler] Erreur parsing JSON:', error);
      // Fallback si le parsing échoue
      return {
        summary: 'Comparaison non structurée disponible',
        sections: [],
        recommendation: 'Consultez les réponses détaillées ci-dessus',
        sources: {
          cgi2025: response2025.sources,
          cgi2026: response2026.sources,
        },
      };
    }
  }

  /**
   * Compare les taux d'imposition entre 2025 et 2026
   */
  compareRates(domain: string): { rate2025: string; rate2026: string; change: string } | null {
    const rateChanges: Record<string, { rate2025: string; rate2026: string; change: string }> = {
      IRPP: {
        rate2025: 'Barème progressif: 1%, 10%, 25%, 40%',
        rate2026: 'Remplacé par ITS avec nouveau barème',
        change: 'Réforme majeure - passage de IRPP à ITS',
      },
      ITS: {
        rate2025: "N'existe pas (IRPP en vigueur)",
        rate2026: 'Barème progressif ITS: 0% (0-464k), puis tranches progressives',
        change: 'Nouveau régime avec première tranche exonérée',
      },
      IS: {
        rate2025: 'Taux 28%, minimum forfaitaire ancien',
        rate2026: 'Taux 28%, minimum de perception 1% ou 2% (Art. 86B)',
        change: 'Nouveau minimum de perception avec 4 acomptes',
      },
      TVA: {
        rate2025: 'Normal 18%, Réduit 5%',
        rate2026: 'Normal 18%, Réduit 5%',
        change: 'Pas de changement majeur',
      },
    };

    return rateChanges[domain] || null;
  }

  /**
   * Génère un tableau comparatif Markdown
   */
  generateComparisonTable(sections: ComparisonSection[]): string {
    if (sections.length === 0) return '';

    let table = '| Aspect | CGI 2025 | CGI 2026 | Impact |\n';
    table += '|--------|----------|----------|--------|\n';

    for (const section of sections) {
      const impactEmoji =
        section.impact === 'favorable' ? '✅' : section.impact === 'defavorable' ? '⚠️' : '➖';
      table += `| ${section.aspect} | ${section.cgi2025} | ${section.cgi2026} | ${impactEmoji} |\n`;
    }

    return table;
  }

  /**
   * Identifie les changements clés entre les deux versions
   */
  getKeyChanges(): string[] {
    return [
      "IRPP → ITS : L'impôt sur le revenu des personnes physiques (IRPP) est remplacé par l'Impôt sur les Traitements et Salaires (ITS) pour les revenus salariaux",
      "Nouvelle première tranche exonérée : 0 à 464.000 FCFA/an exonéré d'ITS",
      "Minimum de perception IS (Art. 86B) : Base = Produits exploitation + financiers + HAO. Taux 1% (normal) ou 2% (déficit 2 ans)",
      "Retenue sur non-résidents (Art. 86C) : 20% sur prestations fournies par des non-résidents",
      '4 acomptes minimum de perception : 15 mars, 15 juin, 15 septembre, 15 décembre',
    ];
  }
}

// Export singleton
export const comparisonHandler = new ComparisonHandler();
export default ComparisonHandler;
