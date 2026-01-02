#!/usr/bin/env npx ts-node
// server/src/tests/generate-manual-check-by-chapter.ts
// Génère des rapports HTML de vérification manuelle PAR CHAPITRE

import { TestQuestion, TestLevel, LEVEL_NAMES } from './test-questions-index.js';
import { hybridSearch, SearchResult } from '../services/rag/hybrid-search.service.js';
import * as fs from 'fs';
import * as path from 'path';

// Import des questions par chapitre
import { ALL_QUESTIONS as IRPP_2025 } from './test-questions-data.js';
import { IS_QUESTIONS } from './test-questions-is.js';
import { DC_QUESTIONS } from './test-questions-dc.js';
import { TD_QUESTIONS } from './test-questions-td.js';
import { DD_QUESTIONS } from './test-questions-dd.js';
import { PV_QUESTIONS } from './test-questions-pv.js';
import { IL_QUESTIONS } from './test-questions-il.js';
import { IS_2026_QUESTIONS } from './test-questions-is-2026.js';
import { IBA_2026_QUESTIONS } from './test-questions-iba-2026.js';

// Configuration des chapitres
interface ChapterConfig {
  id: string;
  name: string;
  version: '2025' | '2026';
  questions: TestQuestion[];
}

const CHAPTERS: ChapterConfig[] = [
  { id: 'irpp-2025', name: 'IRPP (Chapitre 1)', version: '2025', questions: IRPP_2025 },
  { id: 'is-2025', name: 'IS (Chapitre 3)', version: '2025', questions: IS_QUESTIONS },
  { id: 'dc-2025', name: 'Dispositions Communes (Chapitre 4)', version: '2025', questions: DC_QUESTIONS },
  { id: 'td-2025', name: 'Taxes Diverses (Chapitre 5)', version: '2025', questions: TD_QUESTIONS },
  { id: 'dd-2025', name: 'Dispositions Diverses (Chapitre 6)', version: '2025', questions: DD_QUESTIONS },
  { id: 'pv-2025', name: 'Plus-values/BTP/Reassurance (Chapitre 7)', version: '2025', questions: PV_QUESTIONS },
  { id: 'il-2025', name: 'Impots Locaux (Partie 2)', version: '2025', questions: IL_QUESTIONS },
  { id: 'is-2026', name: 'IS (Chapitre 1)', version: '2026', questions: IS_2026_QUESTIONS },
  { id: 'iba-2026', name: 'IBA/IRCM/IRF/ITS (Chapitre 2)', version: '2026', questions: IBA_2026_QUESTIONS },
];

interface FailureReport {
  id: number;
  level: TestLevel;
  question: string;
  category: string;
  expected: string;
  acceptable: string;
  actual: string;
  topContent: string;
  matchTypes: string;
}

const OUTPUT_DIR = './test-results/par-chapitre';

function articleMatches(expected: string, actual: string): boolean {
  const expNorm = expected.replace(/^art\.?\s*/i, '').toLowerCase().trim();
  const actNorm = actual.replace(/^art\.?\s*/i, '').toLowerCase().trim();
  if (expNorm === actNorm) return true;
  const expBase = expNorm.replace(/[-\s]?[a-z]$/i, '').replace(/-\d+$/, '');
  const actBase = actNorm.replace(/[-\s]?[a-z]$/i, '').replace(/-\d+$/, '');
  if (expBase === actBase) return true;
  if (expBase === actNorm || actBase === expNorm) return true;
  if (actNorm.startsWith(expBase) || expNorm.startsWith(actBase)) return true;
  return false;
}

function checkArticleFound(
  expectedArticles: string[],
  acceptableArticles: string[] | undefined,
  foundArticles: string[]
): boolean {
  if (expectedArticles.length === 0) return true;
  const allAccepted = [...expectedArticles, ...(acceptableArticles || [])];
  return allAccepted.some((exp) =>
    foundArticles.some((found) => articleMatches(exp, found))
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateChapterHTML(
  chapter: ChapterConfig,
  failures: FailureReport[],
  totalQuestions: number
): string {
  const now = new Date().toLocaleString('fr-FR');
  const passedCount = totalQuestions - failures.length;
  const rate = Math.round((passedCount / totalQuestions) * 100);

  const byLevel: Record<string, number> = {};
  for (const f of failures) {
    byLevel[f.level] = (byLevel[f.level] || 0) + 1;
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CGI ${chapter.version} - ${chapter.name} - Verifications</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header h1 { margin: 0 0 5px 0; color: #1f2937; }
    .header h2 { margin: 0 0 10px 0; color: #6b7280; font-weight: normal; font-size: 18px; }
    .stats { display: flex; gap: 20px; flex-wrap: wrap; }
    .stat { background: #f3f4f6; padding: 10px 15px; border-radius: 8px; }
    .stat-value { font-size: 24px; font-weight: bold; }
    .stat-label { font-size: 12px; color: #6b7280; }
    .stat.success .stat-value { color: #22c55e; }
    .stat.failure .stat-value { color: #ef4444; }
    .filters { background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; }
    .filter-btn { padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer; font-size: 14px; }
    .filter-btn:hover { background: #f3f4f6; }
    .filter-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
    .card { background: white; border: 1px solid #e5e7eb; margin: 15px 0; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card.resolved { opacity: 0.5; }
    .card.hidden { display: none; }
    .green { border-left: 5px solid #22c55e; }
    .yellow { border-left: 5px solid #eab308; }
    .red { border-left: 5px solid #ef4444; }
    .black { border-left: 5px solid #1f2937; }
    .blue { border-left: 5px solid #3b82f6; }
    .chart { border-left: 5px solid #8b5cf6; }
    .target { border-left: 5px solid #ec4899; }
    .card-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
    .card-id { font-size: 14px; font-weight: bold; padding: 4px 10px; border-radius: 4px; background: #f3f4f6; }
    .card-category { font-size: 12px; color: #6b7280; }
    .question { font-size: 15px; margin: 15px 0; line-height: 1.5; }
    .articles { display: flex; gap: 20px; margin: 15px 0; flex-wrap: wrap; }
    .article-group { flex: 1; min-width: 200px; }
    .article-label { font-size: 12px; font-weight: 600; margin-bottom: 5px; }
    .article-label.expected { color: #22c55e; }
    .article-label.actual { color: #ef4444; }
    .article-value { font-family: monospace; font-size: 14px; padding: 8px 12px; border-radius: 6px; background: #f9fafb; }
    .content { font-size: 13px; color: #4b5563; background: #f9fafb; padding: 12px; border-radius: 8px; line-height: 1.6; margin: 15px 0; border-left: 3px solid #d1d5db; }
    .actions { display: flex; gap: 10px; margin-top: 15px; }
    button { padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; border: none; }
    .btn-ok { background: #22c55e; color: white; }
    .btn-fix { background: #eab308; color: white; }
    .btn-reset { background: #6b7280; color: white; }
    .nav-chapters { background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; }
    .nav-chapters a { margin-right: 10px; padding: 5px 10px; text-decoration: none; color: #3b82f6; }
    .nav-chapters a:hover { text-decoration: underline; }
    .success-msg { background: #d1fae5; color: #065f46; padding: 30px; border-radius: 12px; text-align: center; font-size: 18px; }
  </style>
</head>
<body>
  <div class="nav-chapters">
    <strong>Chapitres:</strong>
    ${CHAPTERS.map(c => `<a href="manual-check-${c.id}.html">${c.version} - ${c.name.split(' ')[0]}</a>`).join('')}
    <a href="manual-check-all.html" style="font-weight: bold;">TOUS</a>
  </div>

  <div class="header">
    <h1>CGI ${chapter.version} - ${chapter.name}</h1>
    <h2>Verifications manuelles</h2>
    <p style="color: #6b7280; margin: 0 0 15px 0;">Genere le ${now}</p>
    <div class="stats">
      <div class="stat success">
        <div class="stat-value">${passedCount}/${totalQuestions}</div>
        <div class="stat-label">Questions reussies (${rate}%)</div>
      </div>
      <div class="stat failure">
        <div class="stat-value">${failures.length}</div>
        <div class="stat-label">A verifier</div>
      </div>
      ${Object.entries(byLevel).map(([level, count]) => `
        <div class="stat">
          <div class="stat-value">${count}</div>
          <div class="stat-label">${LEVEL_NAMES[level as TestLevel] || level}</div>
        </div>
      `).join('')}
    </div>
  </div>

  ${failures.length === 0 ? `
    <div class="success-msg">
      Toutes les ${totalQuestions} questions de ce chapitre sont reussies !
    </div>
  ` : `
    <div class="filters">
      <button class="filter-btn active" onclick="filterLevel('all')">Tous (${failures.length})</button>
      ${Object.entries(byLevel).map(([level, count]) => `
        <button class="filter-btn" onclick="filterLevel('${level}')">${level.toUpperCase()} (${count})</button>
      `).join('')}
    </div>

    <div id="cards">
      ${failures.map(f => `
        <div class="card ${f.level}" data-id="${f.id}" data-level="${f.level}">
          <div class="card-header">
            <div>
              <span class="card-id">#${f.id} [${f.level.toUpperCase()}]</span>
              <span class="card-category">${f.category}</span>
            </div>
          </div>
          <div class="question"><strong>Q:</strong> ${escapeHtml(f.question)}</div>
          <div class="articles">
            <div class="article-group">
              <div class="article-label expected">Attendu</div>
              <div class="article-value">${f.expected || 'Aucun'}</div>
              ${f.acceptable ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Acceptables: ${f.acceptable}</div>` : ''}
            </div>
            <div class="article-group">
              <div class="article-label actual">Trouve (top 3)</div>
              <div class="article-value">${f.actual}</div>
            </div>
          </div>
          <div class="content">${escapeHtml(f.topContent)}...</div>
          <div class="actions">
            <button class="btn-ok" onclick="markOk(${f.id})">Faux negatif (OK)</button>
            <button class="btn-fix" onclick="markFix(${f.id})">Vrai echec</button>
          </div>
        </div>
      `).join('')}
    </div>
  `}

  <script>
    const results = {};
    function markOk(id) {
      results[id] = 'false_negative';
      const card = document.querySelector(\`[data-id="\${id}"]\`);
      card.classList.add('resolved');
      card.querySelector('.actions').innerHTML = '<span style="color: #22c55e;">Marque OK</span>';
    }
    function markFix(id) {
      results[id] = 'true_failure';
      const card = document.querySelector(\`[data-id="\${id}"]\`);
      card.classList.add('resolved');
      card.querySelector('.actions').innerHTML = '<span style="color: #ef4444;">A corriger</span>';
    }
    function filterLevel(level) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      document.querySelectorAll('.card').forEach(card => {
        card.classList.toggle('hidden', level !== 'all' && card.dataset.level !== level);
      });
    }
  </script>
</body>
</html>`;
}

async function processChapter(chapter: ChapterConfig): Promise<{
  failures: FailureReport[];
  passed: number;
  total: number;
}> {
  console.log(`\n${'='.repeat(50)}`);
  console.log(` ${chapter.version} - ${chapter.name}`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Questions: ${chapter.questions.length}`);

  const failures: FailureReport[] = [];
  const DELAY = 300;

  for (let i = 0; i < chapter.questions.length; i++) {
    const q = chapter.questions[i];

    try {
      const results = await hybridSearch(q.question, 5);
      const foundArticles = results.map(r => r.payload.numero);

      const articleFound = checkArticleFound(
        q.expectedArticles,
        q.acceptableArticles,
        foundArticles
      );

      if (!articleFound) {
        failures.push({
          id: q.id,
          level: q.level,
          question: q.question,
          category: q.category,
          expected: q.expectedArticles.map(a => `Art. ${a}`).join(', '),
          acceptable: q.acceptableArticles?.map(a => `Art. ${a}`).join(', ') || '',
          actual: results.slice(0, 3).map(r => `Art. ${r.payload.numero}`).join(', ') || 'Aucun',
          topContent: results[0]?.payload.contenu?.substring(0, 300) || 'N/A',
          matchTypes: results.slice(0, 3).map(r => `${r.payload.numero}(${r.matchType})`).join(', '),
        });
        process.stdout.write('X');
      } else {
        process.stdout.write('.');
      }
    } catch (error) {
      failures.push({
        id: q.id,
        level: q.level,
        question: q.question,
        category: q.category,
        expected: q.expectedArticles.map(a => `Art. ${a}`).join(', '),
        acceptable: q.acceptableArticles?.map(a => `Art. ${a}`).join(', ') || '',
        actual: 'ERREUR',
        topContent: `Erreur: ${error}`,
        matchTypes: 'N/A',
      });
      process.stdout.write('E');
    }

    if (i < chapter.questions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY));
    }
  }

  console.log(`\nResultat: ${chapter.questions.length - failures.length}/${chapter.questions.length} (${failures.length} echecs)`);

  return {
    failures,
    passed: chapter.questions.length - failures.length,
    total: chapter.questions.length,
  };
}

async function generateManualCheckByChapter(): Promise<void> {
  console.log('');
  console.log('='.repeat(60));
  console.log(' CGI 242 - VERIFICATION MANUELLE PAR CHAPITRE');
  console.log('='.repeat(60));

  // Créer le dossier de sortie
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const allResults: { chapter: ChapterConfig; failures: FailureReport[]; passed: number; total: number }[] = [];

  // Traiter chaque chapitre
  for (const chapter of CHAPTERS) {
    const result = await processChapter(chapter);
    allResults.push({ chapter, ...result });

    // Générer le HTML pour ce chapitre
    const html = generateChapterHTML(chapter, result.failures, result.total);
    const outputPath = path.join(OUTPUT_DIR, `manual-check-${chapter.id}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`  -> ${outputPath}`);
  }

  // Générer un fichier index
  const indexHtml = generateIndexHTML(allResults);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml);

  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log(' RESUME');
  console.log('='.repeat(60));

  let totalPassed = 0, totalQuestions = 0, totalFailures = 0;

  for (const r of allResults) {
    totalPassed += r.passed;
    totalQuestions += r.total;
    totalFailures += r.failures.length;
    console.log(`  ${r.chapter.version} ${r.chapter.name}: ${r.passed}/${r.total} (${r.failures.length} echecs)`);
  }

  console.log('');
  console.log(`  TOTAL: ${totalPassed}/${totalQuestions} (${Math.round(totalPassed/totalQuestions*100)}%)`);
  console.log(`  Echecs a verifier: ${totalFailures}`);
  console.log('');
  console.log(`  Rapports generes dans: ${OUTPUT_DIR}/`);
  console.log('='.repeat(60));
}

function generateIndexHTML(results: { chapter: ChapterConfig; failures: FailureReport[]; passed: number; total: number }[]): string {
  const now = new Date().toLocaleString('fr-FR');
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalQuestions = results.reduce((sum, r) => sum + r.total, 0);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>CGI 242 - Index Verifications par Chapitre</title>
  <style>
    body { font-family: sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .header { background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
    .header h1 { margin: 0; }
    table { width: 100%; background: white; border-radius: 12px; overflow: hidden; }
    th, td { padding: 15px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; }
    .rate { font-weight: bold; }
    .rate.good { color: #22c55e; }
    .rate.warn { color: #eab308; }
    .rate.bad { color: #ef4444; }
    a { color: #3b82f6; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CGI 242 - Verifications par Chapitre</h1>
    <p>Genere le ${now}</p>
    <p><strong>Total: ${totalPassed}/${totalQuestions} (${Math.round(totalPassed/totalQuestions*100)}%)</strong></p>
  </div>

  <table>
    <tr>
      <th>Version</th>
      <th>Chapitre</th>
      <th>Reussies</th>
      <th>Echecs</th>
      <th>Taux</th>
      <th>Action</th>
    </tr>
    ${results.map(r => {
      const rate = Math.round(r.passed / r.total * 100);
      const rateClass = rate >= 90 ? 'good' : rate >= 70 ? 'warn' : 'bad';
      return `
        <tr>
          <td>${r.chapter.version}</td>
          <td>${r.chapter.name}</td>
          <td>${r.passed}/${r.total}</td>
          <td>${r.failures.length}</td>
          <td class="rate ${rateClass}">${rate}%</td>
          <td><a href="manual-check-${r.chapter.id}.html">Verifier</a></td>
        </tr>
      `;
    }).join('')}
  </table>
</body>
</html>`;
}

// Exécution
generateManualCheckByChapter().catch(console.error);
