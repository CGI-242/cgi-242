#!/usr/bin/env npx ts-node
// server/src/tests/generate-manual-check.ts
// Génère un rapport HTML des échecs à vérifier manuellement

import { ALL_QUESTIONS, TestQuestion, LEVEL_NAMES, TestLevel } from './test-questions-data.js';
import { hybridSearch, SearchResult } from '../services/rag/hybrid-search.service.js';
import * as fs from 'fs';
import * as path from 'path';

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

const OUTPUT_DIR = './test-results';

/**
 * Vérifie si un article attendu correspond à un article trouvé
 */
function articleMatches(expected: string, actual: string): boolean {
  const expNorm = expected.replace(/^art\.?\s*/i, '').toLowerCase().trim();
  const actNorm = actual.replace(/^art\.?\s*/i, '').toLowerCase().trim();

  if (expNorm === actNorm) return true;

  // Match avec suffixe : Art. 36-B match Art. 36
  const expBase = expNorm.replace(/[-\s]?[a-z]$/i, '').replace(/-\d+$/, '');
  const actBase = actNorm.replace(/[-\s]?[a-z]$/i, '').replace(/-\d+$/, '');

  if (expBase === actBase) return true;
  if (expBase === actNorm || actBase === expNorm) return true;
  if (actNorm.startsWith(expBase) || expNorm.startsWith(actBase)) return true;

  return false;
}

/**
 * Vérifie si au moins un article attendu est trouvé
 */
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

/**
 * Génère le rapport HTML
 */
function generateHTML(failures: FailureReport[], totalQuestions: number): string {
  const now = new Date().toLocaleString('fr-FR');
  const passedCount = totalQuestions - failures.length;
  const rate = Math.round((passedCount / totalQuestions) * 100);

  // Compter par niveau
  const byLevel: Record<string, number> = {};
  for (const f of failures) {
    byLevel[f.level] = (byLevel[f.level] || 0) + 1;
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CGI 242 - Vérifications manuelles</title>
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
    .header h1 { margin: 0 0 10px 0; color: #1f2937; }
    .stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .stat {
      background: #f3f4f6;
      padding: 10px 15px;
      border-radius: 8px;
    }
    .stat-value { font-size: 24px; font-weight: bold; }
    .stat-label { font-size: 12px; color: #6b7280; }
    .stat.success .stat-value { color: #22c55e; }
    .stat.failure .stat-value { color: #ef4444; }

    .filters {
      background: white;
      padding: 15px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .filter-btn {
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 14px;
    }
    .filter-btn:hover { background: #f3f4f6; }
    .filter-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }

    .card {
      background: white;
      border: 1px solid #e5e7eb;
      margin: 15px 0;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }
    .card.resolved { opacity: 0.5; transform: scale(0.98); }
    .card.hidden { display: none; }

    .green { border-left: 5px solid #22c55e; }
    .yellow { border-left: 5px solid #eab308; }
    .red { border-left: 5px solid #ef4444; }
    .black { border-left: 5px solid #1f2937; }
    .blue { border-left: 5px solid #3b82f6; }
    .chart { border-left: 5px solid #8b5cf6; }
    .target { border-left: 5px solid #ec4899; }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    .card-id {
      font-size: 14px;
      font-weight: bold;
      padding: 4px 10px;
      border-radius: 4px;
      background: #f3f4f6;
    }
    .card-category {
      font-size: 12px;
      color: #6b7280;
    }

    .question {
      font-size: 15px;
      margin: 15px 0;
      line-height: 1.5;
      color: #1f2937;
    }

    .articles {
      display: flex;
      gap: 20px;
      margin: 15px 0;
      flex-wrap: wrap;
    }
    .article-group { flex: 1; min-width: 200px; }
    .article-label {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .article-label.expected { color: #22c55e; }
    .article-label.actual { color: #ef4444; }
    .article-value {
      font-family: monospace;
      font-size: 14px;
      padding: 8px 12px;
      border-radius: 6px;
      background: #f9fafb;
    }

    .content {
      font-size: 13px;
      color: #4b5563;
      background: #f9fafb;
      padding: 12px;
      border-radius: 8px;
      line-height: 1.6;
      margin: 15px 0;
      border-left: 3px solid #d1d5db;
    }

    .match-types {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 15px;
    }
    .match-tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      margin-right: 5px;
      font-size: 11px;
    }
    .match-tag.keyword { background: #dbeafe; color: #1e40af; }
    .match-tag.vector { background: #fef3c7; color: #92400e; }
    .match-tag.both { background: #d1fae5; color: #065f46; }

    .actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }
    button {
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      border: none;
      transition: all 0.2s;
    }
    .btn-ok { background: #22c55e; color: white; }
    .btn-ok:hover { background: #16a34a; }
    .btn-fix { background: #eab308; color: white; }
    .btn-fix:hover { background: #ca8a04; }
    .btn-reset { background: #6b7280; color: white; }
    .btn-reset:hover { background: #4b5563; }

    .summary {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin-top: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary h2 { margin: 0 0 15px 0; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    .summary-item {
      padding: 15px;
      border-radius: 8px;
      background: #f9fafb;
    }
    .summary-item h4 { margin: 0 0 10px 0; font-size: 14px; }

    @media print {
      .actions, .filters { display: none; }
      .card { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CGI 242 - Vérifications manuelles</h1>
    <p style="color: #6b7280; margin: 0 0 15px 0;">
      Généré le ${now} | Testez chaque question dans le frontend et marquez si c'est un vrai échec ou un faux négatif.
    </p>
    <div class="stats">
      <div class="stat success">
        <div class="stat-value">${passedCount}/${totalQuestions}</div>
        <div class="stat-label">Questions réussies (${rate}%)</div>
      </div>
      <div class="stat failure">
        <div class="stat-value">${failures.length}</div>
        <div class="stat-label">À vérifier manuellement</div>
      </div>
      ${Object.entries(byLevel).map(([level, count]) => `
        <div class="stat">
          <div class="stat-value">${count}</div>
          <div class="stat-label">${LEVEL_NAMES[level as TestLevel] || level}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="filters">
    <button class="filter-btn active" onclick="filterLevel('all')">Tous (${failures.length})</button>
    ${Object.entries(byLevel).map(([level, count]) => `
      <button class="filter-btn" onclick="filterLevel('${level}')">${level.toUpperCase()} (${count})</button>
    `).join('')}
    <button class="filter-btn btn-reset" onclick="resetAll()">Réinitialiser</button>
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
            <div class="article-value">${f.expected || 'Aucun article attendu'}</div>
            ${f.acceptable ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Acceptables: ${f.acceptable}</div>` : ''}
          </div>
          <div class="article-group">
            <div class="article-label actual">Trouvé (top 3)</div>
            <div class="article-value">${f.actual}</div>
          </div>
        </div>

        <div class="match-types">
          Types de match: ${f.matchTypes.split(', ').map(t => {
            const cls = t.includes('both') ? 'both' : t.includes('keyword') ? 'keyword' : 'vector';
            return `<span class="match-tag ${cls}">${t}</span>`;
          }).join('')}
        </div>

        <div class="content">${escapeHtml(f.topContent)}...</div>

        <div class="actions">
          <button class="btn-ok" onclick="markOk(${f.id})">Faux négatif (réponse OK)</button>
          <button class="btn-fix" onclick="markFix(${f.id})">Vrai échec (à corriger)</button>
        </div>
      </div>
    `).join('')}
  </div>

  <div class="summary" id="summary" style="display: none;">
    <h2>Résumé des vérifications</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <h4>Faux négatifs</h4>
        <div id="falseNegatives"></div>
      </div>
      <div class="summary-item">
        <h4>Vrais échecs à corriger</h4>
        <div id="trueFailures"></div>
      </div>
    </div>
    <button onclick="exportResults()" style="margin-top: 15px;" class="btn-ok">
      Exporter les résultats
    </button>
  </div>

  <script>
    const results = {};

    function markOk(id) {
      results[id] = 'false_negative';
      const card = document.querySelector(\`[data-id="\${id}"]\`);
      card.classList.add('resolved');
      card.querySelector('.actions').innerHTML = '<span style="color: #22c55e; font-weight: 500;">Marqué comme faux négatif</span>';
      updateSummary();
    }

    function markFix(id) {
      results[id] = 'true_failure';
      const card = document.querySelector(\`[data-id="\${id}"]\`);
      card.classList.add('resolved');
      card.querySelector('.actions').innerHTML = '<span style="color: #ef4444; font-weight: 500;">Marqué comme vrai échec</span>';
      updateSummary();
    }

    function filterLevel(level) {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');

      document.querySelectorAll('.card').forEach(card => {
        if (level === 'all' || card.dataset.level === level) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    }

    function resetAll() {
      Object.keys(results).forEach(key => delete results[key]);
      document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('resolved', 'hidden');
        const id = card.dataset.id;
        card.querySelector('.actions').innerHTML = \`
          <button class="btn-ok" onclick="markOk(\${id})">Faux négatif (réponse OK)</button>
          <button class="btn-fix" onclick="markFix(\${id})">Vrai échec (à corriger)</button>
        \`;
      });
      document.getElementById('summary').style.display = 'none';
    }

    function updateSummary() {
      const falseNegs = Object.entries(results).filter(([_, v]) => v === 'false_negative').map(([k]) => k);
      const trueFailures = Object.entries(results).filter(([_, v]) => v === 'true_failure').map(([k]) => k);

      document.getElementById('falseNegatives').innerHTML = falseNegs.length > 0
        ? \`Questions: \${falseNegs.join(', ')} (à ignorer dans les tests)\`
        : 'Aucun';
      document.getElementById('trueFailures').innerHTML = trueFailures.length > 0
        ? \`Questions: \${trueFailures.join(', ')} (à corriger)\`
        : 'Aucun';

      if (Object.keys(results).length > 0) {
        document.getElementById('summary').style.display = 'block';
      }
    }

    function exportResults() {
      const data = {
        timestamp: new Date().toISOString(),
        falseNegatives: Object.entries(results).filter(([_, v]) => v === 'false_negative').map(([k]) => parseInt(k)),
        trueFailures: Object.entries(results).filter(([_, v]) => v === 'true_failure').map(([k]) => parseInt(k)),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'manual-check-results.json';
      a.click();
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Fonction principale
 */
async function generateManualCheckList(): Promise<void> {
  console.log('');
  console.log('='.repeat(60));
  console.log(' CGI 242 - GÉNÉRATION DU RAPPORT DE VÉRIFICATION MANUELLE');
  console.log('='.repeat(60));
  console.log('');

  const failures: FailureReport[] = [];
  const DELAY = 500; // Délai entre les requêtes

  console.log(`Analyse de ${ALL_QUESTIONS.length} questions...`);
  console.log('');

  for (let i = 0; i < ALL_QUESTIONS.length; i++) {
    const q = ALL_QUESTIONS[i];

    try {
      const results = await hybridSearch(q.question, 5);
      const foundArticles = results.map(r => r.payload.numero);

      // Vérifier si l'article attendu est trouvé
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
          actual: results.slice(0, 3).map(r => `Art. ${r.payload.numero}`).join(', ') || 'Aucun résultat',
          topContent: results[0]?.payload.contenu?.substring(0, 300) || 'N/A',
          matchTypes: results.slice(0, 3).map(r => `${r.payload.numero}(${r.matchType})`).join(', '),
        });

        console.log(`[${i + 1}/${ALL_QUESTIONS.length}] Q${q.id} - ÉCHEC`);
      } else {
        console.log(`[${i + 1}/${ALL_QUESTIONS.length}] Q${q.id} - OK`);
      }
    } catch (error) {
      console.error(`[${i + 1}/${ALL_QUESTIONS.length}] Q${q.id} - ERREUR: ${error}`);
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
    }

    // Délai entre les requêtes
    if (i < ALL_QUESTIONS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY));
    }
  }

  // Créer le dossier de sortie si nécessaire
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Générer le HTML
  const html = generateHTML(failures, ALL_QUESTIONS.length);
  const outputPath = path.join(OUTPUT_DIR, 'manual-check.html');
  fs.writeFileSync(outputPath, html);

  console.log('');
  console.log('='.repeat(60));
  console.log(' RAPPORT GÉNÉRÉ');
  console.log('='.repeat(60));
  console.log(`  Fichier: ${outputPath}`);
  console.log(`  Questions à vérifier: ${failures.length}/${ALL_QUESTIONS.length}`);
  console.log(`  Taux de succès RAG: ${Math.round(((ALL_QUESTIONS.length - failures.length) / ALL_QUESTIONS.length) * 100)}%`);
  console.log('');
  console.log('  Ouvrez le fichier HTML dans votre navigateur pour');
  console.log('  tester manuellement les questions et identifier');
  console.log('  les vrais échecs vs les faux négatifs.');
  console.log('='.repeat(60));
}

// Exécution
generateManualCheckList().catch(console.error);
