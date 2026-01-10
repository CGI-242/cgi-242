import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dataDir = './data/cgi/2025';
  const files = fs.readdirSync(dataDir).filter(f => f.startsWith('tome') && f.endsWith('.json'));
  const jsonArticles = new Set<string>();

  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));

    function extractArticles(obj: any) {
      if (obj === null || obj === undefined) return;
      if (obj.articles && Array.isArray(obj.articles)) {
        for (const a of obj.articles) {
          if (a && a.article) {
            const num = a.article.replace(/^Art(?:icle)?\.?\s*/i, '').trim();
            jsonArticles.add(num);
          }
        }
      }
      if (obj.sous_sections && Array.isArray(obj.sous_sections)) {
        for (const ss of obj.sous_sections) {
          extractArticles(ss);
          if (ss && ss.paragraphes) {
            for (const p of ss.paragraphes) extractArticles(p);
          }
        }
      }
      if (obj.sections) {
        for (const s of obj.sections) extractArticles(s);
      }
    }

    extractArticles(content);
  }

  const dbArticles = await prisma.article.findMany({
    where: { version: '2025' },
    select: { numero: true }
  });
  const dbSet = new Set(dbArticles.map(a => a.numero));

  const missing = [...jsonArticles].filter(n => !dbSet.has(n)).sort();

  console.log('JSON:', jsonArticles.size, '| DB:', dbSet.size, '| Manquants:', missing.length);
  if (missing.length > 0) {
    console.log('Manquants:', missing.join(', '));
  }
}

main().finally(() => prisma.$disconnect());
