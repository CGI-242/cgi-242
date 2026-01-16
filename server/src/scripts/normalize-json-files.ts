// server/src/scripts/normalize-json-files.ts
// Script pour normaliser tous les fichiers JSON CGI au format du modèle (tome1-chapitre1)

import fs from 'fs';
import path from 'path';

interface ArticleSource {
  article?: string;
  titre?: string | null;
  texte?: string[];
  mots_cles?: string[];
  statut?: string;
  section?: string;
  annee_application?: number;
  // Champs invalides à supprimer
  texte_introductif?: string;
  intertitre?: string;
}

interface Section {
  section?: number;
  section_titre?: string;
  titre?: string;
  articles?: ArticleSource[];
  sous_sections?: SousSection[];
}

interface SousSection {
  sous_section?: number;
  titre?: string;
  articles?: ArticleSource[];
  paragraphes?: Array<{
    paragraphe?: number;
    titre?: string;
    articles?: ArticleSource[];
  }>;
}

interface SourceFile {
  meta: Record<string, any>;
  articles?: ArticleSource[];
  sections?: Section[];
  sous_sections?: SousSection[];
  // Autres champs à ignorer
  index?: any;
  rag_config?: any;
  tests?: any;
  note?: string;
}

interface NormalizedArticle {
  article: string;
  titre: string | null;
  texte: string[];
  mots_cles: string[];
  statut: string;
  section?: string;
  annee_application?: number;
}

interface NormalizedFile {
  meta: Record<string, any>;
  articles: NormalizedArticle[];
}

function isValidArticle(art: ArticleSource): boolean {
  // Un article valide doit avoir un champ "article" non vide
  return !!(art.article && typeof art.article === 'string' && art.article.trim() !== '');
}

function normalizeArticle(art: ArticleSource, sectionTitle?: string): NormalizedArticle | null {
  if (!isValidArticle(art)) {
    return null;
  }

  return {
    article: art.article!.trim(),
    titre: art.titre || null,
    texte: art.texte || [],
    mots_cles: art.mots_cles || [],
    statut: art.statut || 'en vigueur',
    ...(sectionTitle && { section: sectionTitle }),
    ...(art.annee_application && { annee_application: art.annee_application }),
  };
}

function extractAllArticles(source: SourceFile): NormalizedArticle[] {
  const articles: NormalizedArticle[] = [];

  // 1. Articles directs à la racine
  if (source.articles && Array.isArray(source.articles)) {
    for (const art of source.articles) {
      const normalized = normalizeArticle(art, art.section);
      if (normalized) {
        articles.push(normalized);
      }
    }
  }

  // 2. Articles dans les sections
  if (source.sections && Array.isArray(source.sections)) {
    for (const section of source.sections) {
      const sectionTitle = section.section_titre || section.titre ||
        (section.section ? `Section ${section.section}` : undefined);

      // Articles directs dans la section
      if (section.articles && Array.isArray(section.articles)) {
        for (const art of section.articles) {
          const normalized = normalizeArticle(art, art.section || sectionTitle);
          if (normalized) {
            articles.push(normalized);
          }
        }
      }

      // Articles dans les sous-sections
      if (section.sous_sections && Array.isArray(section.sous_sections)) {
        for (const sousSection of section.sous_sections) {
          const sousSectionTitle = sousSection.titre || sectionTitle;

          if (sousSection.articles && Array.isArray(sousSection.articles)) {
            for (const art of sousSection.articles) {
              const normalized = normalizeArticle(art, art.section || sousSectionTitle);
              if (normalized) {
                articles.push(normalized);
              }
            }
          }
        }
      }
    }
  }

  // 3. Articles dans les sous-sections (ancien format)
  if (source.sous_sections && Array.isArray(source.sous_sections)) {
    for (const sousSection of source.sous_sections) {
      const sectionTitle = sousSection.titre ||
        (sousSection.sous_section ? `Sous-section ${sousSection.sous_section}` : undefined);

      if (sousSection.articles && Array.isArray(sousSection.articles)) {
        for (const art of sousSection.articles) {
          const normalized = normalizeArticle(art, art.section || sectionTitle);
          if (normalized) {
            articles.push(normalized);
          }
        }
      }

      // Paragraphes
      if (sousSection.paragraphes && Array.isArray(sousSection.paragraphes)) {
        for (const paragraphe of sousSection.paragraphes) {
          const paraTitle = paragraphe.titre || sectionTitle;

          if (paragraphe.articles && Array.isArray(paragraphe.articles)) {
            for (const art of paragraphe.articles) {
              const normalized = normalizeArticle(art, art.section || paraTitle);
              if (normalized) {
                articles.push(normalized);
              }
            }
          }
        }
      }
    }
  }

  return articles;
}

function normalizeFile(filePath: string): { success: boolean; articlesBefore: number; articlesAfter: number; message: string } {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data: SourceFile = JSON.parse(content);

    // Ignorer les fichiers sans meta ou qui sont des index/config
    if (!data.meta) {
      return { success: false, articlesBefore: 0, articlesAfter: 0, message: 'Pas de meta' };
    }

    // Ignorer les fichiers d'index
    if ('index' in data && !('articles' in data) && !('sections' in data) && !('sous_sections' in data)) {
      return { success: false, articlesBefore: 0, articlesAfter: 0, message: 'Fichier index ignoré' };
    }

    // Compter les articles avant
    let articlesBefore = 0;
    if (data.articles) articlesBefore += data.articles.length;
    if (data.sections) {
      for (const s of data.sections) {
        if (s.articles) articlesBefore += s.articles.length;
        if (s.sous_sections) {
          for (const ss of s.sous_sections) {
            if (ss.articles) articlesBefore += ss.articles.length;
          }
        }
      }
    }
    if (data.sous_sections) {
      for (const ss of data.sous_sections) {
        if (ss.articles) articlesBefore += ss.articles.length;
        if (ss.paragraphes) {
          for (const p of ss.paragraphes) {
            if (p.articles) articlesBefore += p.articles.length;
          }
        }
      }
    }

    // Extraire et normaliser tous les articles
    const normalizedArticles = extractAllArticles(data);

    // Créer le fichier normalisé
    const normalizedFile: NormalizedFile = {
      meta: data.meta,
      articles: normalizedArticles,
    };

    // Conserver la note si elle existe
    if (data.note) {
      (normalizedFile as any).note = data.note;
    }

    // Écrire le fichier
    fs.writeFileSync(filePath, JSON.stringify(normalizedFile, null, 2) + '\n', 'utf-8');

    return {
      success: true,
      articlesBefore,
      articlesAfter: normalizedArticles.length,
      message: articlesBefore !== normalizedArticles.length
        ? `Modifié: ${articlesBefore} → ${normalizedArticles.length}`
        : 'OK'
    };
  } catch (err) {
    return { success: false, articlesBefore: 0, articlesAfter: 0, message: `Erreur: ${err}` };
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: tsx src/scripts/normalize-json-files.ts <dossier>');
    console.log('');
    console.log('Ce script normalise tous les fichiers JSON pour avoir le même format:');
    console.log('- Aplatit les structures "sections" et "sous_sections"');
    console.log('- Supprime les entrées invalides (texte_introductif, intertitre)');
    console.log('- Assure que tous les articles ont les champs requis');
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);

  if (!fs.existsSync(inputPath)) {
    console.error(`Chemin non trouvé: ${inputPath}`);
    process.exit(1);
  }

  const stat = fs.statSync(inputPath);
  let files: string[] = [];

  if (stat.isDirectory()) {
    files = fs.readdirSync(inputPath)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(inputPath, f));
  } else {
    files = [inputPath];
  }

  console.log(`\n=== Normalisation de ${files.length} fichiers ===\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let modified = 0;
  let errors = 0;
  let skipped = 0;

  for (const file of files) {
    const filename = path.basename(file);
    const result = normalizeFile(file);

    if (result.success) {
      totalBefore += result.articlesBefore;
      totalAfter += result.articlesAfter;

      if (result.articlesBefore !== result.articlesAfter) {
        console.log(`✓ ${filename}: ${result.message}`);
        modified++;
      }
    } else {
      if (result.message.includes('ignoré')) {
        skipped++;
      } else {
        console.log(`✗ ${filename}: ${result.message}`);
        errors++;
      }
    }
  }

  console.log(`\n=== Résumé ===`);
  console.log(`Fichiers traités: ${files.length - skipped - errors}`);
  console.log(`Fichiers modifiés: ${modified}`);
  console.log(`Fichiers ignorés: ${skipped}`);
  console.log(`Erreurs: ${errors}`);
  console.log(`Articles avant: ${totalBefore}`);
  console.log(`Articles après: ${totalAfter}`);
  console.log(`Différence: ${totalAfter - totalBefore}`);
}

main();
