// server/src/config/cgi-taxonomy/index.ts

import { TOME_1 } from './tome1.js';
import { TOME_2 } from './tome2.js';
import { TEXTES_NON_CODIFIES } from './textes-non-codifies.js';
import { CGI_KEYWORDS, CGI_TAUX, extractKeywordsFromText } from './keywords.js';

export const CGI_TAXONOMY = {
  TOME_1,
  TOME_2,
  TEXTES_NON_CODIFIES,
};

export { CGI_KEYWORDS, CGI_TAUX, extractKeywordsFromText };

// Fonction utilitaire pour déterminer le tome selon la page
export function getTomeByPage(page: number): string {
  if (page >= 9 && page <= 147) return 'Tome 1';
  if (page >= 149 && page <= 240) return 'Tome 2';
  if (page >= 241) return 'Textes non codifiés';
  return 'Inconnu';
}

// Fonction pour obtenir la structure à partir d'une page
export function getLocationByPage(page: number): {
  tome: string;
  partie?: string;
  livre?: string;
  chapitre?: string;
} {
  const tome = getTomeByPage(page);

  if (tome === 'Tome 1') {
    for (const partie of TOME_1.parties) {
      if (page >= partie.pageDebut && page <= partie.pageFin) {
        const result: { tome: string; partie?: string; livre?: string; chapitre?: string } = {
          tome,
          partie: partie.nom,
        };

        if ('livres' in partie && partie.livres) {
          for (const livre of partie.livres) {
            if (page >= livre.pageDebut && page <= livre.pageFin) {
              result.livre = livre.nom;

              if (livre.chapitres) {
                for (const chapitre of livre.chapitres) {
                  if (page >= chapitre.pageDebut && (chapitre.pageFin ? page <= chapitre.pageFin : true)) {
                    result.chapitre = chapitre.nom;
                    break;
                  }
                }
              }
              break;
            }
          }
        }
        return result;
      }
    }
  }

  return { tome };
}

export default CGI_TAXONOMY;
