/**
 * Script de test COMPLET des réponses de l'agent CGI
 * Teste les 100 questions du fichier de tests
 */

import { readFileSync } from 'fs';
import { cgiAgent } from '../src/agents/cgi-agent.js';

interface TestCase {
  id: number;
  categorie: string;
  question: string;
  reponse_attendue: string;
  articles_attendus: string[];
  mots_cles: string[];
}

interface TestSuite {
  test_suite: {
    version: string;
    total_tests: number;
  };
  tests: TestCase[];
}

async function runFullTests() {
  // Charger les tests
  const testsFile = readFileSync('data/cgi/2026/cgi_2026_is_tests_v2.json', 'utf-8');
  const testSuite: TestSuite = JSON.parse(testsFile);

  console.log('='.repeat(70));
  console.log('TEST AGENT CGI - Suite complète de 100 questions');
  console.log('='.repeat(70));
  console.log(`Version: ${testSuite.test_suite.version}`);
  console.log(`Total tests: ${testSuite.test_suite.total_tests}`);
  console.log();

  let passed = 0;
  let failed = 0;
  let errors = 0;
  const results: { id: number; categorie: string; status: string; attendu: string; trouve: string }[] = [];

  for (const test of testSuite.tests) {
    process.stdout.write(`[${test.id.toString().padStart(3, '0')}] ${test.categorie.padEnd(20)} `);

    try {
      const response = await cgiAgent.process(test.question);
      const articlesCites = response.sources.map(s => s.numero);

      // Vérifier si au moins un article attendu est cité
      const found = test.articles_attendus.some(art => {
        const artNum = art.replace('Art. ', '').trim();
        return articlesCites.some(cited => {
          const citedNum = cited.replace('Art. ', '').trim();
          return citedNum === artNum || citedNum.startsWith(artNum + ' ') || cited.includes(artNum);
        });
      });

      if (found) {
        console.log(`✓ PASS`);
        passed++;
        results.push({
          id: test.id,
          categorie: test.categorie,
          status: 'PASS',
          attendu: test.articles_attendus.join(','),
          trouve: articlesCites.slice(0, 3).join(',')
        });
      } else {
        console.log(`✗ FAIL (attendu: ${test.articles_attendus.join(',')} | trouvé: ${articlesCites.slice(0, 3).join(',')})`);
        failed++;
        results.push({
          id: test.id,
          categorie: test.categorie,
          status: 'FAIL',
          attendu: test.articles_attendus.join(','),
          trouve: articlesCites.slice(0, 3).join(',')
        });
      }

      // Petit délai pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.log(`⚠ ERROR (${error instanceof Error ? error.message.substring(0, 30) : 'Erreur'})`);
      errors++;
      results.push({
        id: test.id,
        categorie: test.categorie,
        status: 'ERROR',
        attendu: test.articles_attendus.join(','),
        trouve: 'N/A'
      });
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(70));
  console.log('RÉSUMÉ');
  console.log('='.repeat(70));
  console.log(`✓ Réussis:  ${passed}/${testSuite.tests.length} (${Math.round(passed/testSuite.tests.length*100)}%)`);
  console.log(`✗ Échoués:  ${failed}/${testSuite.tests.length}`);
  console.log(`⚠ Erreurs:  ${errors}/${testSuite.tests.length}`);

  // Stats par catégorie
  console.log('\n' + '-'.repeat(70));
  console.log('Par catégorie:');
  const categories = [...new Set(results.map(r => r.categorie))];
  for (const cat of categories.sort()) {
    const catResults = results.filter(r => r.categorie === cat);
    const catPassed = catResults.filter(r => r.status === 'PASS').length;
    const rate = Math.round(catPassed / catResults.length * 100);
    const bar = '█'.repeat(Math.round(rate / 10)) + '░'.repeat(10 - Math.round(rate / 10));
    console.log(`  ${cat.padEnd(25)} ${bar} ${rate}% (${catPassed}/${catResults.length})`);
  }

  // Liste des échecs
  if (failed > 0) {
    console.log('\n' + '-'.repeat(70));
    console.log('Tests échoués:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  [${r.id}] ${r.categorie}: attendu ${r.attendu}, trouvé ${r.trouve}`);
    });
  }

  console.log('\n' + '='.repeat(70));

  process.exit(failed > 0 || errors > 0 ? 1 : 0);
}

runFullTests().catch(console.error);
