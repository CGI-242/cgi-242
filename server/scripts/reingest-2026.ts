// Script pour réingérer les articles CGI 2026
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../src/config/database.js';
import { ingestFromSource } from '../src/services/rag/ingestion.service.js';

async function main() {
  console.log('Suppression des articles 2026 existants...');

  // Supprimer les articles 2026 existants
  const deleted = await prisma.article.deleteMany({
    where: { version: '2026' }
  });
  console.log(`${deleted.count} articles supprimés`);

  // Charger les fichiers JSON 2026
  const dataDir = './data/cgi/2026';
  // Note: Les fichiers sont maintenant nommés tome1-livre1-chapitreX.json
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  console.log(`\nIngestion de ${files.length} fichiers...`);

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    console.log(`\nTraitement: ${file}`);

    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const result = await ingestFromSource([content]);

    console.log(`  -> ${result.inserted} insérés, ${result.updated} mis à jour, ${result.errors} erreurs`);
  }

  // Vérifier le résultat
  const count = await prisma.article.count({ where: { version: '2026' } });
  console.log(`\nTotal articles 2026 en base: ${count}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
