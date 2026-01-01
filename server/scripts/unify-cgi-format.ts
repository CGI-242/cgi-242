// Script pour uniformiser le format CGI 2026 au style 2025
import * as fs from 'fs';
import * as path from 'path';

interface Article {
  article: string;
  titre?: string;
  texte: string[];
  mots_cles?: string[];
  statut?: string;
}

interface Section {
  section: number;
  titre: string;
  articles?: Article[];
  sous_sections?: any[];
}

interface ChapterFile {
  meta: {
    document?: string;
    pays?: string;
    edition?: string;
    version?: string;
    tome: number;
    partie?: number;
    livre: number;
    chapitre: number;
    chapitre_titre?: string;
    titre?: string;
    section?: number;
    source?: string;
  };
  articles?: Article[];
  sections?: Section[];
}

// Génère un titre basé sur le contenu de l'article
function generateTitle(article: Article): string {
  const text = article.texte.join(' ');

  // Extraire la première phrase ou les premiers 60 caractères
  const firstSentence = text.split(/[.!?]/)[0];
  if (firstSentence.length <= 80) {
    return firstSentence.trim();
  }

  // Sinon, tronquer intelligemment
  return text.substring(0, 60).trim() + '...';
}

// Normalise le format de l'article "Article 1er" -> "Art. 1"
function normalizeArticleNumber(article: string): string {
  // "Article 1er" -> "Art. 1"
  let match = article.match(/Article\s+(\d+)(?:er|ère|ème|e)?/i);
  if (match) {
    return `Art. ${match[1]}`;
  }

  // "Article 105A" -> "Art. 105A"
  match = article.match(/Article\s+(\d+[A-Z]?)/i);
  if (match) {
    return `Art. ${match[1]}`;
  }

  // Déjà au bon format
  if (article.startsWith('Art.')) {
    return article;
  }

  return article;
}

// Fusionne les fichiers sections en un fichier chapitre
function mergeSectionsToChapter(sectionFiles: string[], outputPath: string): void {
  const sections: Section[] = [];
  let meta: any = null;

  for (const filePath of sectionFiles) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ChapterFile;

    if (!meta) {
      meta = {
        document: 'Code général des impôts',
        pays: 'République du Congo',
        edition: content.meta.version || '2026',
        tome: content.meta.tome,
        partie: content.meta.partie || 1,
        livre: content.meta.livre,
        chapitre: content.meta.chapitre,
        chapitre_titre: content.meta.chapitre_titre || content.meta.titre,
        source: content.meta.source
      };
    }

    // Normaliser les articles
    const normalizedArticles = (content.articles || []).map(art => ({
      ...art,
      article: normalizeArticleNumber(art.article),
      titre: art.titre || generateTitle(art)
    }));

    sections.push({
      section: content.meta.section || sections.length + 1,
      titre: content.meta.titre || `Section ${content.meta.section}`,
      articles: normalizedArticles,
      sous_sections: content.sections?.[0]?.sous_sections
    });
  }

  // Trier les sections par numéro
  sections.sort((a, b) => a.section - b.section);

  const output: ChapterFile = {
    meta,
    sections
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Créé: ${outputPath} (${sections.length} sections)`);
}

// Point d'entrée
async function main() {
  const baseDir = '/home/christelle-mabika/cgi-engine/server/data/cgi/2026';
  const outputDir = '/home/christelle-mabika/cgi-engine/server/data/cgi/2026-unified';

  // Créer le répertoire de sortie
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Trouver tous les chapitres
  const chaptersMap = new Map<string, string[]>();

  function scanDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith('.json')) {
        // Extraire le chemin du chapitre
        const match = fullPath.match(/chapitre(\d+)/);
        if (match) {
          const chapterKey = fullPath.replace(/\/section.*\.json$/, '');
          if (!chaptersMap.has(chapterKey)) {
            chaptersMap.set(chapterKey, []);
          }
          chaptersMap.get(chapterKey)!.push(fullPath);
        }
      }
    }
  }

  scanDir(path.join(baseDir, 'tome1'));

  // Fusionner chaque chapitre
  for (const [chapterPath, sectionFiles] of chaptersMap) {
    const match = chapterPath.match(/livre(\d+)\/chapitre(\d+)/);
    if (match) {
      const livre = match[1];
      const chapitre = match[2];
      const outputFile = path.join(outputDir, `tome1-livre${livre}-chapitre${chapitre}.json`);

      // Trier les fichiers par numéro de section
      sectionFiles.sort((a, b) => {
        const numA = parseInt(a.match(/section(\d+)/)?.[1] || '0');
        const numB = parseInt(b.match(/section(\d+)/)?.[1] || '0');
        return numA - numB;
      });

      mergeSectionsToChapter(sectionFiles, outputFile);
    }
  }

  console.log('\nUnification terminée!');
}

main().catch(console.error);
