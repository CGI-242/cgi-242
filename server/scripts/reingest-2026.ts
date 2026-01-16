// Script pour réingérer les articles CGI (2025 ou 2026)
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../src/config/database.js';
import { ingestFromSource } from '../src/services/rag/ingestion.service.js';

// Paramètre: version à ingérer (2025 par défaut)
const VERSION = process.argv[2] || '2025';

async function main() {
  console.log(`Suppression des articles ${VERSION} existants...`);

  // Supprimer les articles existants
  const deleted = await prisma.article.deleteMany({
    where: { version: VERSION }
  });
  console.log(`${deleted.count} articles supprimés`);

  // Charger les fichiers JSON
  const dataDir = `./data/cgi/${VERSION}`;
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && !f.includes('corrections'));

  console.log(`\nIngestion de ${files.length} fichiers CGI ${VERSION}...`);

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    console.log(`\nTraitement: ${file}`);

    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const result = await ingestFromSource([content]);

    console.log(`  -> ${result.inserted} insérés, ${result.updated} mis à jour, ${result.errors} erreurs`);
  }

  // Vérifier le résultat
  const count = await prisma.article.count({ where: { version: VERSION } });
  console.log(`\nTotal articles ${VERSION} en base: ${count}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
