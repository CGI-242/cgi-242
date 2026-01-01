// tests/agent-2025.test.ts
import { agent2025 } from '../src/agents/agent-2025.js';

interface TestCase {
  question: string;
  expectedArticle: string;
  mustContain: string[];
  mustNotContain?: string[];
}

const testCases: TestCase[] = [
  {
    question: "Quelles sont les sept catégories de revenus composant le revenu net global imposable à l'IRPP ?",
    expectedArticle: "Art. 1",
    mustContain: [
      "revenus fonciers",
      "bénéfices des activités industrielles, commerciales et artisanales",
      "traitements, salaires",
      "bénéfices des professions non commerciales",
      "revenus des capitaux mobiliers",
      "plus-values",
      "bénéfices de l'exploitation agricole"
    ],
    mustNotContain: [
      "Art. 11",
      "revenus divers",
      "revenus des créances"
    ]
  },
  {
    question: "Quel est le barème de l'IRPP ?",
    expectedArticle: "Art. 95",
    mustContain: ["1%", "10%", "25%", "40%", "464.000", "1.000.000", "3.000.000"],
    mustNotContain: []
  },
  {
    question: "Quelle est la durée d'absence qui fait perdre la résidence fiscale ?",
    expectedArticle: "Art. 2",
    mustContain: ["vingt-quatre mois", "24"],
    mustNotContain: []
  }
];

interface TestResult {
  question: string;
  passed: boolean;
  errors: string[];
  response?: string;
  articlesConsulted?: string[];
}

async function runTest(testCase: TestCase): Promise<TestResult> {
  const errors: string[] = [];

  try {
    console.log(`\n📝 Test: "${testCase.question.substring(0, 50)}..."`);

    const response = await agent2025.process(testCase.question);
    const answer = response.answer.toLowerCase();
    const answerOriginal = response.answer;

    // Vérifier l'article attendu
    if (!answerOriginal.includes(testCase.expectedArticle)) {
      errors.push(`❌ Article attendu "${testCase.expectedArticle}" non trouvé`);
    } else {
      console.log(`  ✅ Article ${testCase.expectedArticle} cité`);
    }

    // Vérifier les termes obligatoires
    for (const term of testCase.mustContain) {
      if (!answer.includes(term.toLowerCase())) {
        errors.push(`❌ Terme manquant: "${term}"`);
      }
    }
    const foundTerms = testCase.mustContain.filter(t => answer.includes(t.toLowerCase()));
    console.log(`  ✅ Termes trouvés: ${foundTerms.length}/${testCase.mustContain.length}`);

    // Vérifier les termes interdits
    if (testCase.mustNotContain) {
      for (const term of testCase.mustNotContain) {
        if (answerOriginal.includes(term)) {
          errors.push(`❌ Terme interdit présent: "${term}"`);
        }
      }
      if (testCase.mustNotContain.length > 0) {
        const forbiddenFound = testCase.mustNotContain.filter(t => answerOriginal.includes(t));
        if (forbiddenFound.length === 0) {
          console.log(`  ✅ Aucun terme interdit trouvé`);
        }
      }
    }

    return {
      question: testCase.question,
      passed: errors.length === 0,
      errors,
      response: answerOriginal,
      articlesConsulted: response.metadata?.articlesConsulted
    };

  } catch (error) {
    errors.push(`❌ Erreur d'exécution: ${error}`);
    return {
      question: testCase.question,
      passed: false,
      errors
    };
  }
}

async function runAllTests(): Promise<void> {
  console.log('🧪 ========================================');
  console.log('   TESTS AGENT CGI 2025 - Anti-Hallucination');
  console.log('========================================\n');

  const results: TestResult[] = [];

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);

    if (!result.passed) {
      console.log(`\n  ⚠️ ÉCHEC:`);
      result.errors.forEach(e => console.log(`     ${e}`));
      console.log(`\n  📄 Réponse reçue (extrait):`);
      console.log(`     ${result.response?.substring(0, 300)}...`);
      if (result.articlesConsulted) {
        console.log(`\n  📚 Articles consultés: ${result.articlesConsulted.join(', ')}`);
      }
    }
  }

  // Résumé
  console.log('\n\n📊 ========================================');
  console.log('   RÉSUMÉ DES TESTS');
  console.log('========================================');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`✅ Réussis: ${passed}/${results.length}`);
  console.log(`❌ Échoués: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log('\n❌ Tests échoués:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.question.substring(0, 50)}...`);
      r.errors.forEach(e => console.log(`     ${e}`));
    });
  }

  console.log('\n========================================\n');

  // Exit code basé sur les résultats
  process.exit(failed > 0 ? 1 : 0);
}

// Exécuter les tests
runAllTests().catch(console.error);
