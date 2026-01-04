/**
 * Script de test des réponses de l'agent CGI
 * Vérifie que l'agent cite les bons articles
 */

import { cgiAgent } from '../src/agents/cgi-agent.js';

interface TestCase {
  id: number;
  question: string;
  articles_attendus: string[];
}

const TESTS_SAMPLE: TestCase[] = [
  { id: 1, question: "Quel est le taux normal de l'impôt sur les sociétés au Congo ?", articles_attendus: ["Art. 86A"] },
  { id: 3, question: "Quel est le taux du minimum de perception ?", articles_attendus: ["Art. 86B"] },
  { id: 8, question: "Pendant combien d'années peut-on reporter un déficit fiscal ?", articles_attendus: ["Art. 75"] },
  { id: 10, question: "Quelle est la durée minimum de présence pour constituer un établissement stable de services ?", articles_attendus: ["Art. 4A"] },
  { id: 17, question: "Quelles entités sont exonérées d'IS ?", articles_attendus: ["Art. 3"] },
  { id: 22, question: "Quelle est la limite de déductibilité des frais de siège ?", articles_attendus: ["Art. 38"] },
  { id: 23, question: "Quelle est la limite de déductibilité des intérêts ?", articles_attendus: ["Art. 49"] },
  { id: 30, question: "Quelle amende pour défaut de documentation prix de transfert ?", articles_attendus: ["Art. 81"] },
  { id: 38, question: "Quelle durée de chantier crée un établissement stable ?", articles_attendus: ["Art. 4A"] },
  { id: 44, question: "Quel est le plafond du crédit d'impôt investissement ?", articles_attendus: ["Art. 3A"] },
];

async function runTests() {
  console.log('='.repeat(60));
  console.log('TEST AGENT CGI - Vérification des réponses');
  console.log('='.repeat(60));
  console.log();

  let passed = 0;
  let failed = 0;

  for (const test of TESTS_SAMPLE) {
    console.log(`\n[Test ${test.id}] ${test.question}`);
    console.log(`Articles attendus: ${test.articles_attendus.join(', ')}`);

    try {
      const response = await cgiAgent.process(test.question);
      const articlesCites = response.sources.map(s => s.numero);

      // Vérifier si au moins un article attendu est cité
      const found = test.articles_attendus.some(art =>
        articlesCites.some(cited => cited.includes(art.replace('Art. ', '')))
      );

      if (found) {
        console.log(`✓ PASS - Articles trouvés: ${articlesCites.slice(0, 3).join(', ')}`);
        passed++;
      } else {
        console.log(`✗ FAIL - Articles trouvés: ${articlesCites.slice(0, 3).join(', ')}`);
        failed++;
      }

      // Afficher un extrait de la réponse
      console.log(`  Réponse: ${response.answer.substring(0, 150)}...`);

    } catch (error) {
      console.log(`✗ ERROR - ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`RÉSULTATS: ${passed}/${TESTS_SAMPLE.length} tests réussis (${Math.round(passed/TESTS_SAMPLE.length*100)}%)`);
  console.log('='.repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
