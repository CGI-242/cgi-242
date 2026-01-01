// server/src/scripts/test-hybrid-search.ts
import { hybridSearch } from '../services/rag/hybrid-search.service.js';

interface TestCase {
  query: string;
  expectedArticle: string;
  description: string;
}

const testQueries: TestCase[] = [
  {
    query: "Quelles sont les sept catégories de revenus qui composent le revenu net global imposable à l'IRPP ?",
    expectedArticle: '1',
    description: 'Catégories de revenus IRPP',
  },
  {
    query: "Quelle est la durée d'absence qui fait perdre la résidence fiscale au Congo ?",
    expectedArticle: '2',
    description: 'Durée absence résidence fiscale',
  },
  {
    query: "Quel est le barème de l'IRPP ?",
    expectedArticle: '95',
    description: 'Barème IRPP',
  },
  {
    query: 'Combien de parts pour un couple marié avec 3 enfants ?',
    expectedArticle: '91',
    description: 'Quotient familial',
  },
  {
    query: 'Quelles sont les personnes imposables à l\'IRPP ?',
    expectedArticle: '2',
    description: 'Personnes imposables',
  },
  {
    query: 'Quel est le taux de l\'impôt sur les sociétés ?',
    expectedArticle: '119',
    description: 'Taux IS',
  },
];

async function runTests(): Promise<void> {
  console.log('');
  console.log('='.repeat(60));
  console.log('   TEST DE LA RECHERCHE HYBRIDE');
  console.log('='.repeat(60));
  console.log('');

  let passed = 0;
  let failed = 0;

  for (const test of testQueries) {
    console.log(`Test: ${test.description}`);
    console.log(`Query: "${test.query.substring(0, 50)}..."`);
    console.log(`Article attendu: Art. ${test.expectedArticle}`);

    try {
      const results = await hybridSearch(test.query, 5);
      const articleNumbers = results.map((r) => r.payload.numero);
      const firstResult = results[0]?.payload.numero;
      const found = articleNumbers.includes(test.expectedArticle);
      const isFirst = firstResult === test.expectedArticle;

      console.log(`Résultats: ${results.map((r) => `${r.payload.numero}(${r.matchType})`).join(', ')}`);

      if (isFirst) {
        console.log(`\x1b[32m✅ PASS - Art. ${test.expectedArticle} en 1ère position\x1b[0m`);
        passed++;
      } else if (found) {
        console.log(
          `\x1b[33m⚠️ PARTIAL - Art. ${test.expectedArticle} trouvé mais pas en 1ère position (1er: ${firstResult})\x1b[0m`
        );
        passed++;
      } else {
        console.log(`\x1b[31m❌ FAIL - Art. ${test.expectedArticle} NON trouvé\x1b[0m`);
        failed++;
      }
    } catch (error) {
      console.log(`\x1b[31m❌ ERROR - ${error}\x1b[0m`);
      failed++;
    }

    console.log('-'.repeat(60));
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`   RÉSUMÉ: ${passed}/${testQueries.length} tests passés`);
  if (failed > 0) {
    console.log(`   \x1b[31m${failed} tests échoués\x1b[0m`);
  } else {
    console.log(`   \x1b[32mTous les tests sont passés!\x1b[0m`);
  }
  console.log('='.repeat(60));
  console.log('');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
