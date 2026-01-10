/**
 * Script de test des réponses de l'agent CGI - Chapitre 2 (IBA, IRCM, IRF, ITS)
 * Teste les 80 questions du fichier cgi_2026_chapitre2_tests.json
 */

import { readFileSync } from 'fs';
import { cgiAgent } from '../src/agents/cgi-agent.js';

interface TestCase {
  id: number;
  categorie: string;
  impot: string;
  question: string;
  reponse_attendue: string;
  articles_attendus: string[];
  mots_cles: string[];
}

interface TestSuite {
  test_suite: {
    version: string;
    chapitre: string;
    code: string;
    created: string;
    total_tests: number;
  };
  tests: TestCase[];
  statistiques_tests: {
    par_impot: Record<string, number>;
    par_categorie: Record<string, number>;
    par_difficulte: Record<string, number>;
  };
}

async function runChapitre2Tests() {
  // Charger les tests du chapitre 2
  const testsFile = readFileSync('data/cgi/2026/cgi_2026_chapitre2_tests.json', 'utf-8');
  const testSuite: TestSuite = JSON.parse(testsFile);

  console.log('='.repeat(70));
  console.log('TEST AGENT CGI - Chapitre 2: IBA, IRCM, IRF, ITS');
  console.log('='.repeat(70));
  console.log(`Version: ${testSuite.test_suite.version}`);
  console.log(`Chapitre: ${testSuite.test_suite.chapitre}`);
  console.log(`Total tests: ${testSuite.test_suite.total_tests}`);
  console.log(`Date: ${testSuite.test_suite.created}`);
  console.log();

  let passed = 0;
  let failed = 0;
  let errors = 0;
  const results: { id: number; impot: string; categorie: string; status: string; attendu: string; trouve: string }[] = [];

  for (const test of testSuite.tests) {
    process.stdout.write(`[${test.id.toString().padStart(3, '0')}] ${test.impot.padEnd(5)} ${test.categorie.padEnd(25)} `);

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
          impot: test.impot,
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
          impot: test.impot,
          categorie: test.categorie,
          status: 'FAIL',
          attendu: test.articles_attendus.join(','),
          trouve: articlesCites.slice(0, 3).join(',')
        });
      }

      // Petit délai pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.log(`⚠ ERROR (${error instanceof Error ? error.message.substring(0, 30) : 'Erreur'})`);
      errors++;
      results.push({
        id: test.id,
        impot: test.impot,
        categorie: test.categorie,
        status: 'ERROR',
        attendu: test.articles_attendus.join(','),
        trouve: 'N/A'
      });
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(70));
  console.log('RÉSUMÉ GLOBAL');
  console.log('='.repeat(70));
  console.log(`✓ Réussis:  ${passed}/${testSuite.tests.length} (${Math.round(passed/testSuite.tests.length*100)}%)`);
  console.log(`✗ Échoués:  ${failed}/${testSuite.tests.length}`);
  console.log(`⚠ Erreurs:  ${errors}/${testSuite.tests.length}`);

  // Stats par impôt
  console.log('\n' + '-'.repeat(70));
  console.log('Par impôt:');
  const impots = ['IBA', 'IRCM', 'IRF', 'ITS'];
  for (const impot of impots) {
    const impotResults = results.filter(r => r.impot === impot);
    if (impotResults.length === 0) continue;
    const impotPassed = impotResults.filter(r => r.status === 'PASS').length;
    const rate = Math.round(impotPassed / impotResults.length * 100);
    const bar = '█'.repeat(Math.round(rate / 10)) + '░'.repeat(10 - Math.round(rate / 10));
    console.log(`  ${impot.padEnd(6)} ${bar} ${rate.toString().padStart(3)}% (${impotPassed}/${impotResults.length})`);
  }

  // Stats par catégorie
  console.log('\n' + '-'.repeat(70));
  console.log('Par catégorie:');
  const categories = [...new Set(results.map(r => r.categorie))];
  for (const cat of categories.sort()) {
    const catResults = results.filter(r => r.categorie === cat);
    const catPassed = catResults.filter(r => r.status === 'PASS').length;
    const rate = Math.round(catPassed / catResults.length * 100);
    const bar = '█'.repeat(Math.round(rate / 10)) + '░'.repeat(10 - Math.round(rate / 10));
    console.log(`  ${cat.padEnd(28)} ${bar} ${rate.toString().padStart(3)}% (${catPassed}/${catResults.length})`);
  }

  // Liste des échecs
  if (failed > 0) {
    console.log('\n' + '-'.repeat(70));
    console.log('Tests échoués:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  [${r.id}] ${r.impot} - ${r.categorie}: attendu ${r.attendu}, trouvé ${r.trouve}`);
    });
  }

  // Liste des erreurs
  if (errors > 0) {
    console.log('\n' + '-'.repeat(70));
    console.log('Tests en erreur:');
    results.filter(r => r.status === 'ERROR').forEach(r => {
      console.log(`  [${r.id}] ${r.impot} - ${r.categorie}`);
    });
  }

  console.log('\n' + '='.repeat(70));

  process.exit(failed > 0 || errors > 0 ? 1 : 0);
}

runChapitre2Tests().catch(console.error);
