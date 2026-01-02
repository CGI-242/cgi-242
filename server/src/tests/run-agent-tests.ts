#!/usr/bin/env npx ts-node
// server/src/tests/run-agent-tests.ts
// Tests de validation des réponses de l'agent CGI 242 (CGI 2026)

import { cgiAgent } from '../agents/cgi-agent.js';
import * as fs from 'fs';

interface AgentTestCase {
  id: number;
  level: 'green' | 'yellow' | 'red' | 'black';
  question: string;
  mustContain: string[];
  mustNotContain?: string[];
  description: string;
  expectedArticle?: string;
}

const AGENT_TESTS: AgentTestCase[] = [
  // ============================================
  // NIVEAU GREEN - Questions factuelles IS
  // ============================================
  {
    id: 1,
    level: 'green',
    question: "Quel est le taux de l'impôt sur les sociétés ?",
    mustContain: ['25%', '86'],
    description: 'Taux IS = 25% (Art. 86A)',
    expectedArticle: '86A',
  },
  {
    id: 2,
    level: 'green',
    question: "Qu'est-ce que le minimum de perception ?",
    mustContain: ['1%', '86B'],
    description: 'Minimum de perception = 1% (Art. 86B)',
    expectedArticle: '86B',
  },
  {
    id: 3,
    level: 'green',
    question: "Quelles sont les personnes imposables à l'IS ?",
    mustContain: ['sociétés', '2'],
    description: 'Personnes imposables IS (Art. 2)',
    expectedArticle: '2',
  },

  // ============================================
  // NIVEAU GREEN - Questions factuelles IBA
  // ============================================
  {
    id: 4,
    level: 'green',
    question: "Quel est le taux de l'IBA ?",
    mustContain: ['30%', '95'],
    description: 'Taux IBA = 30% (Art. 95)',
    expectedArticle: '95',
  },
  {
    id: 5,
    level: 'green',
    question: "Qui est imposable à l'IBA ?",
    mustContain: ['93'],
    description: 'Personnes imposables IBA (Art. 93B)',
    expectedArticle: '93B',
  },

  // ============================================
  // NIVEAU GREEN - Questions factuelles IRCM
  // ============================================
  {
    id: 6,
    level: 'green',
    question: "Quel est le taux de l'IRCM ?",
    mustContain: ['15%', '110'],
    description: 'Taux IRCM = 15% (Art. 110)',
    expectedArticle: '110',
  },
  {
    id: 7,
    level: 'green',
    question: "Les dividendes sont-ils imposables à l'IRCM ?",
    mustContain: ['105', 'dividende'],
    description: 'Dividendes imposables IRCM (Art. 105A)',
    expectedArticle: '105A',
  },

  // ============================================
  // NIVEAU GREEN - Questions factuelles IRF
  // ============================================
  {
    id: 8,
    level: 'green',
    question: "Quel est le taux d'imposition des loyers ?",
    mustContain: ['9%', '113'],
    description: 'Taux IRF loyers = 9% (Art. 113)',
    expectedArticle: '113',
  },
  {
    id: 9,
    level: 'green',
    question: "Comment sont imposées les plus-values immobilières ?",
    mustContain: ['15%', '111'],
    description: 'Taux plus-values immobilières = 15% (Art. 111B)',
    expectedArticle: '111B',
  },

  // ============================================
  // NIVEAU GREEN - Questions factuelles ITS
  // ============================================
  {
    id: 10,
    level: 'green',
    question: "Quel est le barème de l'ITS ?",
    mustContain: ['116', '10%'],
    description: 'Barème ITS (Art. 116)',
    expectedArticle: '116',
  },
  {
    id: 11,
    level: 'green',
    question: "Quel est l'impôt minimum annuel de l'ITS ?",
    mustContain: ['1 200', '116'],
    description: 'Impôt minimum ITS = 1 200 FCFA (Art. 116)',
    expectedArticle: '116',
  },
  {
    id: 12,
    level: 'green',
    question: "Comment évaluer le logement comme avantage en nature ?",
    mustContain: ['20%', '115'],
    description: 'Logement = 20% salaire plafonné (Art. 115)',
    expectedArticle: '115',
  },

  // ============================================
  // NIVEAU YELLOW - Calculs et applications
  // ============================================
  {
    id: 13,
    level: 'yellow',
    question: "Quel est le taux du minimum de perception en cas de déficit sur 2 exercices consécutifs ?",
    mustContain: ['2%', '86B'],
    description: 'Minimum de perception = 2% si déficit 2 ans (Art. 86B)',
    expectedArticle: '86B',
  },
  {
    id: 14,
    level: 'yellow',
    question: "Quelles sont les dates des acomptes du minimum de perception ?",
    mustContain: ['mars', 'juin', 'septembre', 'décembre'],
    description: 'Acomptes: 15 mars, 15 juin, 15 sept, 15 déc',
    expectedArticle: '86B',
  },
  {
    id: 15,
    level: 'yellow',
    question: "Comment est évaluée la voiture de fonction comme avantage en nature ?",
    mustContain: ['3%', '115'],
    description: 'Voiture = 3% du salaire brut (Art. 115)',
    expectedArticle: '115',
  },

  // ============================================
  // NIVEAU RED - Cas pratiques complexes
  // ============================================
  {
    id: 16,
    level: 'red',
    question: "Qu'est-ce que l'intégration fiscale ?",
    mustContain: ['91', 'groupe'],
    description: 'Intégration fiscale (Art. 91)',
    expectedArticle: '91',
  },
  {
    id: 17,
    level: 'red',
    question: "Quelles sont les conditions d'éligibilité au régime des holdings ?",
    mustContain: ['90', 'holding'],
    description: 'Régime holdings (Art. 90)',
    expectedArticle: '90',
  },
  {
    id: 18,
    level: 'red',
    question: "Qu'est-ce que le quitus fiscal ?",
    mustContain: ['92G', 'sortie'],
    description: 'Quitus fiscal (Art. 92G)',
    expectedArticle: '92G',
  },

  // ============================================
  // NIVEAU BLACK - Questions pièges
  // ============================================
  {
    id: 19,
    level: 'black',
    question: "Quelles sont les méthodes de détermination du prix de pleine concurrence ?",
    mustContain: ['85', 'prix'],
    description: 'Prix de transfert (Art. 85)',
    expectedArticle: '85',
  },
  {
    id: 20,
    level: 'black',
    question: "Comment reporter les déficits fiscaux ?",
    mustContain: ['75', 'déficit'],
    description: 'Report des déficits (Art. 75)',
    expectedArticle: '75',
  },
];

interface TestResult {
  id: number;
  level: string;
  passed: boolean;
  question: string;
  foundTerms: string[];
  missingTerms: string[];
  forbiddenTerms: string[];
  responseTime: number;
  response: string;
  expectedArticle?: string;
}

async function runAgentTests(): Promise<void> {
  console.log('');
  console.log('='.repeat(70));
  console.log(' TEST DE L\'AGENT CGI 242 (CGI 2026)');
  console.log('='.repeat(70));
  console.log('');

  const results: TestResult[] = [];
  const DELAY = 1500;

  for (let i = 0; i < AGENT_TESTS.length; i++) {
    const test = AGENT_TESTS[i];
    const startTime = Date.now();

    console.log(`[${i + 1}/${AGENT_TESTS.length}] Test #${test.id} (${test.level})`);
    console.log(`   Q: ${test.question.substring(0, 60)}...`);

    try {
      const response = await cgiAgent.process(test.question);
      const responseTime = Date.now() - startTime;
      const responseLower = response.answer.toLowerCase();

      // Vérifier les termes requis
      const foundTerms = test.mustContain.filter((term) =>
        responseLower.includes(term.toLowerCase())
      );
      const missingTerms = test.mustContain.filter(
        (term) => !responseLower.includes(term.toLowerCase())
      );

      // Vérifier les termes interdits
      const forbiddenTerms = (test.mustNotContain || []).filter((term) =>
        responseLower.includes(term.toLowerCase())
      );

      const passed =
        missingTerms.length === 0 && forbiddenTerms.length === 0;

      const status = passed
        ? '\x1b[32m✓ PASS\x1b[0m'
        : '\x1b[31m✗ FAIL\x1b[0m';

      console.log(`   ${status} ${test.description}`);
      if (!passed) {
        if (missingTerms.length > 0) {
          console.log(`   Manquants: ${missingTerms.join(', ')}`);
        }
        if (forbiddenTerms.length > 0) {
          console.log(`   Interdits présents: ${forbiddenTerms.join(', ')}`);
        }
        console.log(`   Réponse: ${response.answer.substring(0, 150)}...`);
      }
      console.log(`   Temps: ${responseTime}ms`);
      console.log('');

      results.push({
        id: test.id,
        level: test.level,
        passed,
        question: test.question,
        foundTerms,
        missingTerms,
        forbiddenTerms,
        responseTime,
        response: response.answer,
        expectedArticle: test.expectedArticle,
      });
    } catch (error) {
      console.log(`   \x1b[31m✗ ERROR\x1b[0m ${error}`);
      results.push({
        id: test.id,
        level: test.level,
        passed: false,
        question: test.question,
        foundTerms: [],
        missingTerms: test.mustContain,
        forbiddenTerms: [],
        responseTime: Date.now() - startTime,
        response: `Erreur: ${error}`,
        expectedArticle: test.expectedArticle,
      });
    }

    // Délai entre les tests
    if (i < AGENT_TESTS.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELAY));
    }
  }

  // Résumé
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const rate = Math.round((passed / results.length) * 100);

  // Par niveau
  const byLevel = {
    green: results.filter((r) => r.level === 'green'),
    yellow: results.filter((r) => r.level === 'yellow'),
    red: results.filter((r) => r.level === 'red'),
    black: results.filter((r) => r.level === 'black'),
  };

  console.log('='.repeat(70));
  console.log(' RESUME');
  console.log('='.repeat(70));
  console.log(`  Total:   ${results.length} tests`);
  console.log(`  Réussi:  ${passed} (${rate}%)`);
  console.log(`  Échoué:  ${failed}`);
  console.log('');

  console.log('Par niveau:');
  for (const [level, tests] of Object.entries(byLevel)) {
    const levelPassed = tests.filter((t) => t.passed).length;
    const levelRate = tests.length > 0
      ? Math.round((levelPassed / tests.length) * 100)
      : 0;
    const emoji = level === 'green' ? '🟢' : level === 'yellow' ? '🟡' : level === 'red' ? '🔴' : '⚫';
    console.log(
      `  ${emoji} ${level.toUpperCase()}: ${levelPassed}/${tests.length} (${levelRate}%)`
    );
  }

  console.log('');

  // Barre de progression
  const bar = '█'.repeat(Math.floor(rate / 5)) + '░'.repeat(20 - Math.floor(rate / 5));
  console.log(`  [${bar}] ${rate}%`);
  console.log('');

  // Générer rapport HTML
  generateHTMLReport(results, rate);

  // Statut final
  if (rate >= 80) {
    console.log('  \x1b[32m✓ Agent performant\x1b[0m');
  } else if (rate >= 60) {
    console.log('  \x1b[33m⚠ Agent partiellement performant\x1b[0m');
  } else {
    console.log('  \x1b[31m✗ Agent nécessite des améliorations\x1b[0m');
  }

  console.log('');
  console.log('='.repeat(70));

  // Code de sortie
  process.exit(rate >= 70 ? 0 : 1);
}

/**
 * Génère un rapport HTML des tests échoués
 */
function generateHTMLReport(results: TestResult[], rate: number): void {
  const failed = results.filter((r) => !r.passed);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport Tests CGI 242 - ${timestamp}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
    .summary { display: flex; gap: 20px; margin-bottom: 30px; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex: 1; text-align: center; }
    .stat-card.success { border-left: 4px solid #28a745; }
    .stat-card.fail { border-left: 4px solid #dc3545; }
    .stat-card.rate { border-left: 4px solid #007bff; }
    .stat-value { font-size: 2em; font-weight: bold; }
    .stat-label { color: #666; margin-top: 5px; }
    .progress-bar { background: #e9ecef; border-radius: 10px; height: 20px; margin: 20px 0; overflow: hidden; }
    .progress-fill { background: ${rate >= 80 ? '#28a745' : rate >= 60 ? '#ffc107' : '#dc3545'}; height: 100%; transition: width 0.5s; }
    h2 { color: #dc3545; margin-top: 40px; }
    .test-card { background: white; margin: 15px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #dc3545; }
    .test-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .test-id { background: #dc3545; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
    .test-level { padding: 4px 12px; border-radius: 4px; font-size: 0.9em; }
    .level-green { background: #d4edda; color: #155724; }
    .level-yellow { background: #fff3cd; color: #856404; }
    .level-red { background: #f8d7da; color: #721c24; }
    .level-black { background: #333; color: white; }
    .test-question { font-size: 1.1em; margin: 10px 0; color: #333; }
    .test-details { margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; }
    .detail-row { display: flex; margin: 8px 0; }
    .detail-label { font-weight: bold; width: 150px; color: #666; }
    .detail-value { flex: 1; }
    .missing { color: #dc3545; }
    .response { background: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 10px; font-size: 0.9em; white-space: pre-wrap; max-height: 200px; overflow-y: auto; }
    .all-passed { text-align: center; padding: 40px; color: #28a745; }
    .all-passed svg { width: 60px; height: 60px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 Rapport de Tests CGI 242</h1>
    <p>Généré le ${new Date().toLocaleString('fr-FR')}</p>

    <div class="summary">
      <div class="stat-card success">
        <div class="stat-value">${results.filter(r => r.passed).length}</div>
        <div class="stat-label">Tests réussis</div>
      </div>
      <div class="stat-card fail">
        <div class="stat-value">${failed.length}</div>
        <div class="stat-label">Tests échoués</div>
      </div>
      <div class="stat-card rate">
        <div class="stat-value">${rate}%</div>
        <div class="stat-label">Taux de réussite</div>
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" style="width: ${rate}%"></div>
    </div>

    <h2>❌ Tests échoués (${failed.length})</h2>

    ${failed.length === 0 ? `
    <div class="all-passed">
      <svg viewBox="0 0 24 24" fill="#28a745"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
      <h3>Tous les tests sont passés !</h3>
    </div>
    ` : failed.map(r => `
    <div class="test-card">
      <div class="test-header">
        <span class="test-id">Test #${r.id}</span>
        <span class="test-level level-${r.level}">${r.level.toUpperCase()}</span>
      </div>
      <div class="test-question">${r.question}</div>
      <div class="test-details">
        <div class="detail-row">
          <span class="detail-label">Article attendu:</span>
          <span class="detail-value">${r.expectedArticle || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Termes manquants:</span>
          <span class="detail-value missing">${r.missingTerms.join(', ') || 'Aucun'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Temps de réponse:</span>
          <span class="detail-value">${r.responseTime}ms</span>
        </div>
        <div class="response">${r.response.substring(0, 500)}${r.response.length > 500 ? '...' : ''}</div>
      </div>
    </div>
    `).join('')}
  </div>
</body>
</html>`;

  const outputDir = './test-results';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filepath = `${outputDir}/test-report-${timestamp}.html`;
  fs.writeFileSync(filepath, html);
  console.log(`  📄 Rapport HTML: ${filepath}`);
}

// Exécution
runAgentTests().catch(console.error);
