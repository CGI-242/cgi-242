#!/usr/bin/env npx ts-node
// server/src/tests/run-agent-tests.ts
// Tests de validation des réponses de l'agent CGI 242 (calculs et interprétations)

import { agent2025 } from '../agents/agent-2025.js';

interface AgentTestCase {
  id: number;
  level: 'yellow' | 'red' | 'black';
  question: string;
  mustContain: string[];
  mustNotContain?: string[];
  description: string;
  expectedAnswer?: string;
}

const AGENT_TESTS: AgentTestCase[] = [
  // ============================================
  // NIVEAU YELLOW - Calculs et applications
  // ============================================
  {
    id: 18,
    level: 'yellow',
    question: "Combien de parts a un contribuable marié avec 3 enfants à charge ?",
    mustContain: ['3,5', '91'],
    description: 'Calcul quotient familial: 2 (marié) + 0.5×3 (enfants) = 3.5 parts',
    expectedAnswer: '3,5 parts',
  },
  {
    id: 19,
    level: 'yellow',
    question: "Un contribuable célibataire sans enfant a un revenu net imposable de 5 000 000 FCFA. Calculez son IRPP.",
    mustContain: ['1 part', '95'],
    description: 'Calcul IRPP: 1 part, barème Art. 95',
    expectedAnswer: 'Environ 1 358 240 FCFA',
  },
  {
    id: 20,
    level: 'yellow',
    question: "Un couple marié avec 2 enfants déclare un revenu global de 8 000 000 FCFA. Déterminez le nombre de parts.",
    mustContain: ['3 parts', '91'],
    description: 'Calcul: 2 (marié) + 0.5×2 (enfants) = 3 parts',
    expectedAnswer: '3 parts',
  },
  {
    id: 21,
    level: 'yellow',
    question: "Un salarié perçoit un salaire brut mensuel de 800 000 FCFA avec un logement de fonction. Calculez l'avantage en nature logement.",
    mustContain: ['%', '39', 'logement'],
    description: 'Avantage en nature logement: 15% du salaire plafonné CNSS',
  },

  // ============================================
  // NIVEAU RED - Cas pratiques complexes
  // ============================================
  {
    id: 27,
    level: 'red',
    question: "Cas Monsieur KOUMBA : Marié, 4 enfants. Déterminez son nombre de parts fiscales.",
    mustContain: ['4 parts', '91'],
    description: 'Calcul: 2 (marié) + 0.5×4 (enfants) = 4 parts',
    expectedAnswer: '4 parts',
  },
  {
    id: 28,
    level: 'red',
    question: "Cas Madame MBONGO : Femme mariée, séparée de biens, ne vivant pas avec son mari. Comment est-elle imposée ?",
    mustContain: ['4', 'sépar', 'distinct'],
    description: 'Imposition distincte selon Art. 4',
  },
  {
    id: 29,
    level: 'red',
    question: "Une SNC réalise un bénéfice de 50 000 000 FCFA. L'associé A détient 60%. Quelle est sa quote-part imposable ?",
    mustContain: ['30 000 000', '6', '60%'],
    description: 'Quote-part: 50M × 60% = 30M FCFA',
    expectedAnswer: '30 000 000 FCFA',
  },

  // ============================================
  // NIVEAU BLACK - Questions pièges
  // ============================================
  {
    id: 37,
    level: 'black',
    question: "Un veuf sans enfant à charge bénéficie-t-il automatiquement de 2 parts pendant toute sa vie ?",
    mustContain: ['91', 'deux'],
    mustNotContain: ['oui automatiquement', 'toujours 2 parts'],
    description: 'Non, seulement pendant 2 années suivant le décès du conjoint',
  },
  {
    id: 38,
    level: 'black',
    question: "La taxe immobilière sur les loyers est déductible de l'IRPP. Que se passe-t-il si cette taxe est supérieure à l'IRPP dû ?",
    mustContain: ['89', 'imputable', 'excédent'],
    description: 'L\'excédent n\'est pas remboursable, imputation dans la limite de l\'IRPP',
  },
  {
    id: 41,
    level: 'black',
    question: "Un contribuable au régime réel peut-il opter pour le forfait si son CA passe sous le seuil ?",
    mustContain: ['26', 'option'],
    description: 'Oui, sous conditions (CA < seuil pendant 2 ans consécutifs)',
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
  responseExcerpt: string;
}

async function runAgentTests(): Promise<void> {
  console.log('');
  console.log('='.repeat(70));
  console.log(' TEST DES REPONSES DE L\'AGENT CGI 242');
  console.log(' Validation des calculs et interprétations');
  console.log('='.repeat(70));
  console.log('');

  const results: TestResult[] = [];
  const DELAY = 1000;

  for (let i = 0; i < AGENT_TESTS.length; i++) {
    const test = AGENT_TESTS[i];
    const startTime = Date.now();

    console.log(`[${i + 1}/${AGENT_TESTS.length}] Test #${test.id} (${test.level})`);
    console.log(`   Q: ${test.question.substring(0, 60)}...`);

    try {
      const response = await agent2025.process(test.question);
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
        ? '\x1b[32m PASS \x1b[0m'
        : '\x1b[31m FAIL \x1b[0m';

      console.log(`  ${status} ${test.description}`);
      if (!passed) {
        if (missingTerms.length > 0) {
          console.log(`   Manquants: ${missingTerms.join(', ')}`);
        }
        if (forbiddenTerms.length > 0) {
          console.log(`   Interdits présents: ${forbiddenTerms.join(', ')}`);
        }
        console.log(`   Réponse: ${response.answer.substring(0, 100)}...`);
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
        responseExcerpt: response.answer.substring(0, 200),
      });
    } catch (error) {
      console.log(`  \x1b[31m ERROR \x1b[0m ${error}`);
      results.push({
        id: test.id,
        level: test.level,
        passed: false,
        question: test.question,
        foundTerms: [],
        missingTerms: test.mustContain,
        forbiddenTerms: [],
        responseTime: Date.now() - startTime,
        responseExcerpt: `Erreur: ${error}`,
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
    const emoji = level === 'yellow' ? '  ' : level === 'red' ? '  ' : '  ';
    console.log(
      `  ${emoji} ${level.toUpperCase()}: ${levelPassed}/${tests.length} (${levelRate}%)`
    );
  }

  console.log('');

  // Barre de progression
  const bar = '█'.repeat(Math.floor(rate / 5)) + '░'.repeat(20 - Math.floor(rate / 5));
  console.log(`  [${bar}] ${rate}%`);
  console.log('');

  // Statut final
  if (rate >= 80) {
    console.log('  \\x1b[32mAgent performant\\x1b[0m');
  } else if (rate >= 60) {
    console.log('  \\x1b[33mAgent partiellement performant\\x1b[0m');
  } else {
    console.log('  \\x1b[31mAgent nécessite des améliorations\\x1b[0m');
  }

  console.log('');
  console.log('='.repeat(70));

  // Code de sortie
  process.exit(rate >= 70 ? 0 : 1);
}

// Exécution
runAgentTests().catch(console.error);
