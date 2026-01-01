// Script pour ingérer le fichier CGI 2026 corrigé
import * as fs from 'fs';
import { prisma } from '../src/config/database.js';
import { ingestFromSource } from '../src/services/rag/ingestion.service.js';

async function main() {
  console.log('Suppression des articles 2026 existants...');

  const deleted = await prisma.article.deleteMany({
    where: { version: '2026' }
  });
  console.log(`${deleted.count} articles supprimés`);

  // Charger le fichier JSON corrigé
  const filePath = './data/cgi/2026/tome1-livre1-chapitre1-ok.json';
  console.log(`\nIngestion de ${filePath}...`);

  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const result = await ingestFromSource([content]);

  console.log(`-> ${result.inserted} insérés, ${result.updated} mis à jour, ${result.errors} erreurs`);

  // Vérifier le résultat
  const articles = await prisma.article.findMany({
    where: { version: '2026' },
    select: { numero: true, titre: true },
    orderBy: { numero: 'asc' },
    take: 10
  });

  console.log('\nArticles 2026 en base:');
  articles.forEach(a => console.log(`  Art. ${a.numero}: ${a.titre}`));

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
