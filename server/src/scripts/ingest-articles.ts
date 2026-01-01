// server/src/scripts/ingest-articles.ts
import fs from 'fs';
import path from 'path';
import { ingestArticles, ingestFromSource, ArticleJSON } from '../services/rag/ingestion.service.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('IngestScript');

interface ArticleItem {
  article: string;
  titre?: string;
  texte: string[];
  mots_cles?: string[];
  statut?: string;
}

interface SousSection {
  sous_section?: number;
  titre?: string;
  articles?: ArticleItem[];
  paragraphes?: Array<{
    paragraphe?: number;
    titre?: string;
    articles?: ArticleItem[];
  }>;
}

interface SourceFile {
  meta: Record<string, string | number | undefined>;
  articles?: ArticleItem[];
  sous_sections?: SousSection[];
}

function isSourceFormat(data: SourceFile | SourceFile[] | ArticleJSON[]): data is SourceFile | SourceFile[] {
  if (Array.isArray(data)) {
    const first = data[0];
    if (!first) return false;
    // Supporte articles ou sous_sections
    return 'meta' in first && ('articles' in first || 'sous_sections' in first);
  }
  // Supporte articles ou sous_sections
  return 'meta' in data && ('articles' in data || 'sous_sections' in data);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    logger.info('Usage: tsx src/scripts/ingest-articles.ts <fichier.json ou dossier>');
    logger.info('');
    logger.info('Formats supportés:');
    logger.info('1. Format source (ton format):');
    logger.info('   { "meta": {...}, "articles": [...] }');
    logger.info('');
    logger.info('2. Format plat:');
    logger.info('   [{ "numero": "1", "contenu": "..." }, ...]');
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);

  if (!fs.existsSync(inputPath)) {
    logger.error(`Chemin non trouvé: ${inputPath}`);
    process.exit(1);
  }

  try {
    const stat = fs.statSync(inputPath);
    let result;

    if (stat.isDirectory()) {
      const files = fs.readdirSync(inputPath).filter(f => f.endsWith('.json'));
      logger.info(`Trouvé ${files.length} fichiers JSON dans ${inputPath}`);

      const sources: SourceFile[] = [];
      for (const file of files) {
        const content = fs.readFileSync(path.join(inputPath, file), 'utf-8');
        const data = JSON.parse(content);
        if (isSourceFormat(data)) {
          if (Array.isArray(data)) {
            sources.push(...data);
          } else {
            sources.push(data);
          }
        }
      }

      logger.info(`Chargé ${sources.length} sections`);
      result = await ingestFromSource(sources);
    } else {
      const content = fs.readFileSync(inputPath, 'utf-8');
      const data = JSON.parse(content);

      if (isSourceFormat(data)) {
        const sources = Array.isArray(data) ? data : [data];
        logger.info(`Format source détecté: ${sources.length} section(s)`);
        result = await ingestFromSource(sources);
      } else if (Array.isArray(data)) {
        logger.info(`Format plat détecté: ${data.length} articles`);
        result = await ingestArticles(data);
      } else {
        logger.error('Format non reconnu');
        process.exit(1);
      }
    }

    logger.info('=== Résultat ===');
    logger.info(`Total: ${result.total}`);
    logger.info(`Insérés: ${result.inserted}`);
    logger.info(`Mis à jour: ${result.updated}`);
    logger.info(`Erreurs: ${result.errors}`);
    logger.info(`Tokens utilisés: ${result.tokensUsed}`);

    process.exit(result.errors > 0 ? 1 : 0);
  } catch (err) {
    logger.error('Erreur:', err);
    process.exit(1);
  }
}

main();
