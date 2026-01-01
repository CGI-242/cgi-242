// Script pour uniformiser CGI 2026 au format 2025
import * as fs from 'fs';
import * as path from 'path';

interface Article {
  article: string;
  titre?: string;
  texte: string[];
  mots_cles?: string[];
  statut?: string;
}

interface SousSection {
  sous_section: number | string;
  titre: string;
  articles?: Article[];
}

interface Section {
  section: number;
  titre: string;
  articles?: Article[];
  sous_sections?: SousSection[];
}

// Génère un titre basé sur le contenu de l'article
function generateTitle(article: Article): string {
  const text = article.texte.join(' ').trim();

  // Prendre la première phrase
  const firstSentence = text.split(/[.!?:]/)[0].trim();

  if (firstSentence.length <= 60) {
    return firstSentence;
  }

  // Tronquer à 60 caractères sur un mot complet
  const truncated = firstSentence.substring(0, 57);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}

// Normalise "Article 1er" -> "Art. 1", "Article 105A" -> "Art. 105A"
function normalizeArticleNumber(article: string): string {
  // "Article 1er" ou "Article 1ère" -> "Art. 1"
  let match = article.match(/Article\s+(\d+)(?:er|ère|ème|e)?(?:\s|$)/i);
  if (match) {
    return `Art. ${match[1]}`;
  }

  // "Article 105A" -> "Art. 105A"
  match = article.match(/Article\s+(\d+[A-Z]?)/i);
  if (match) {
    return `Art. ${match[1]}`;
  }

  // Déjà au format "Art. X"
  if (article.startsWith('Art.')) {
    return article;
  }

  return article;
}

// Normalise un article
function normalizeArticle(art: Article): Article {
  return {
    article: normalizeArticleNumber(art.article),
    titre: art.titre || generateTitle(art),
    texte: art.texte,
    mots_cles: art.mots_cles || [],
    statut: art.statut || 'en vigueur'
  };
}

// Normalise les articles dans une sous-section
function normalizeSousSection(ss: SousSection): SousSection {
  return {
    sous_section: ss.sous_section,
    titre: ss.titre,
    articles: (ss.articles || []).map(normalizeArticle)
  };
}

// Charge et fusionne tous les fichiers d'un chapitre
function mergeChapterFiles(chapterDir: string, chapterNum: number): Section[] {
  const sections: Section[] = [];
  const files = fs.readdirSync(chapterDir).filter(f => f.endsWith('.json')).sort((a, b) => {
    const numA = parseInt(a.match(/section(\d+)/)?.[1] || '0');
    const numB = parseInt(b.match(/section(\d+)/)?.[1] || '0');
    return numA - numB;
  });

  for (const file of files) {
    const filePath = path.join(chapterDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const sectionNum = content.meta?.section || sections.length + 1;
    const sectionTitle = content.meta?.titre || `Section ${sectionNum}`;

    const section: Section = {
      section: sectionNum,
      titre: sectionTitle
    };

    // Cas 1: articles directs
    if (content.articles && content.articles.length > 0) {
      section.articles = content.articles.map(normalizeArticle);
    }

    // Cas 2: sous_sections
    if (content.sous_sections && content.sous_sections.length > 0) {
      section.sous_sections = content.sous_sections.map(normalizeSousSection);
    }

    sections.push(section);
  }

  return sections;
}

// Point d'entrée
async function main() {
  const baseDir = '/home/christelle-mabika/cgi-engine/server/data/cgi/2026/tome1/livre1';
  const outputDir = '/home/christelle-mabika/cgi-engine/server/data/cgi';

  // Trouver tous les chapitres
  const chapters = fs.readdirSync(baseDir).filter(d => d.startsWith('chapitre'));

  for (const chapterFolder of chapters) {
    const chapterNum = parseInt(chapterFolder.replace('chapitre', ''));
    const chapterDir = path.join(baseDir, chapterFolder);

    if (!fs.statSync(chapterDir).isDirectory()) continue;

    console.log(`Traitement du ${chapterFolder}...`);

    const sections = mergeChapterFiles(chapterDir, chapterNum);

    // Déterminer le titre du chapitre depuis la première section
    let chapterTitle = `Chapitre ${chapterNum}`;
    const firstFile = fs.readdirSync(chapterDir).find(f => f.endsWith('.json'));
    if (firstFile) {
      const firstContent = JSON.parse(fs.readFileSync(path.join(chapterDir, firstFile), 'utf-8'));
      if (chapterNum === 1) chapterTitle = 'Impôt sur les sociétés (IS)';
      else if (chapterNum === 2) chapterTitle = 'Impôt sur le bénéfice des affaires (IBA)';
    }

    const output = {
      meta: {
        document: 'Code général des impôts',
        pays: 'République du Congo',
        edition: '2026',
        tome: 1,
        partie: 1,
        livre: 1,
        chapitre: chapterNum,
        chapitre_titre: chapterTitle,
        source: 'LF 2026 - Directive CEMAC n°0119/25-UEAC-177-CM-42'
      },
      sections
    };

    // Compter les articles
    let articleCount = 0;
    for (const section of sections) {
      articleCount += (section.articles || []).length;
      for (const ss of section.sous_sections || []) {
        articleCount += (ss.articles || []).length;
      }
    }

    const outputFile = path.join(outputDir, `2026-tome1-livre1-chapitre${chapterNum}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`  -> ${outputFile} (${sections.length} sections, ${articleCount} articles)`);
  }

  console.log('\nUnification terminée!');
}

main().catch(console.error);
