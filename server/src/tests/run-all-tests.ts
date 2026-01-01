#!/usr/bin/env npx ts-node
// server/src/tests/run-all-tests.ts
// Script de test complet du RAG CGI 242

import { agent2025 } from '../agents/agent-2025.js';
import {
  ALL_QUESTIONS,
  QUESTIONS_BY_LEVEL,
  TARGET_RATES,
  LEVEL_NAMES,
  TestQuestion,
  TestResult,
  TestReport,
  TestLevel,
} from './test-questions-data.js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const DELAY_BETWEEN_TESTS = 1000; // 1 seconde entre chaque test (rate limiting API)
const OUTPUT_DIR = './test-results';

/**
 * Normalise un numéro d'article pour comparaison
 */
function normalizeArticle(article: string): string {
  return article
    .replace(/^Art\.?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Extrait les numéros d'articles mentionnés dans la réponse
 */
function extractArticlesFromResponse(response: string): string[] {
  const patterns = [
    /Art(?:icle)?\.?\s*(\d+(?:\s*(?:bis|ter|quater|quinquies|sexies|septies|octies))?(?:\s*-\s*\d+)?)/gi,
    /article\s+(\d+(?:\s*(?:bis|ter|quater))?)/gi,
  ];

  const articles = new Set<string>();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(response)) !== null) {
      const normalized = normalizeArticle(match[1]);
      articles.add(normalized);
    }
  }

  return Array.from(articles);
}

/**
 * Compare deux numéros d'articles avec gestion des suffixes
 * Art. 36-B match Art. 36 et inversement
 */
function articleMatches(expected: string, actual: string): boolean {
  // Normaliser
  const expNorm = expected.replace(/^art\.?\s*/i, '').toLowerCase().trim();
  const actNorm = actual.replace(/^art\.?\s*/i, '').toLowerCase().trim();

  // Match exact
  if (expNorm === actNorm) return true;

  // Match avec suffixe : Art. 36-B match Art. 36
  const expBase = expNorm.replace(/[-\s]?[a-z]$/i, '').replace(/-\d+$/, '');
  const actBase = actNorm.replace(/[-\s]?[a-z]$/i, '').replace(/-\d+$/, '');

  if (expBase === actBase) return true;
  if (expBase === actNorm || actBase === expNorm) return true;

  // Match partiel pour les variantes
  if (actNorm.startsWith(expBase) || expNorm.startsWith(actBase)) return true;

  return false;
}

/**
 * Vérifie si les articles attendus sont présents
 * @param expected - Articles attendus (principaux)
 * @param found - Articles trouvés dans la réponse
 * @param acceptable - Articles alternatifs acceptables
 */
function checkArticleMatch(
  expected: string[],
  found: string[],
  acceptable?: string[]
): boolean {
  if (expected.length === 0) return true; // Pas d'article attendu = OK

  // Combiner articles attendus et acceptables
  const allAccepted = [...expected, ...(acceptable || [])];

  // Au moins un article attendu ou acceptable doit être trouvé
  return allAccepted.some((exp) =>
    found.some((f) => articleMatches(exp, f))
  );
}

/**
 * Vérifie si le contenu attendu est présent
 */
function checkContentMatch(
  response: string,
  mustContain?: string[],
  mustNotContain?: string[]
): { passed: boolean; errors: string[] } {
  const errors: string[] = [];
  const lowerResponse = response.toLowerCase();

  // Vérifier les termes requis
  if (mustContain) {
    for (const term of mustContain) {
      // Au moins un des termes séparés par | doit être présent
      const alternatives = term.split('|').map((t) => t.trim().toLowerCase());
      const found = alternatives.some((alt) => lowerResponse.includes(alt));
      if (!found) {
        errors.push(`Terme manquant: "${term}"`);
      }
    }
  }

  // Vérifier les termes interdits
  if (mustNotContain) {
    for (const term of mustNotContain) {
      if (lowerResponse.includes(term.toLowerCase())) {
        errors.push(`Terme interdit présent: "${term}"`);
      }
    }
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}

/**
 * Exécute un test individuel
 */
async function runSingleTest(question: TestQuestion): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const response = await agent2025.process(question.question);
    const responseTime = Date.now() - startTime;

    const foundArticles = extractArticlesFromResponse(response.answer);
    const articleMatch = checkArticleMatch(
      question.expectedArticles,
      foundArticles,
      question.acceptableArticles
    );
    const contentCheck = checkContentMatch(
      response.answer,
      question.mustContain,
      question.mustNotContain
    );

    const passed = articleMatch && contentCheck.passed;

    return {
      id: question.id,
      question: question.question,
      level: question.level,
      passed,
      expectedArticles: question.expectedArticles,
      foundArticles,
      articleMatch,
      contentMatch: contentCheck.passed,
      response: response.answer,
      responseTime,
      errors: contentCheck.errors.length > 0 ? contentCheck.errors : undefined,
    };
  } catch (error) {
    return {
      id: question.id,
      question: question.question,
      level: question.level,
      passed: false,
      expectedArticles: question.expectedArticles,
      foundArticles: [],
      articleMatch: false,
      contentMatch: false,
      response: '',
      responseTime: Date.now() - startTime,
      errors: [`Erreur: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

/**
 * Affiche la progression
 */
function showProgress(current: number, total: number, result: TestResult): void {
  const status = result.passed ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  const articles = result.foundArticles.length > 0
    ? `[${result.foundArticles.slice(0, 3).join(', ')}]`
    : '[aucun]';

  console.log(
    `[${current}/${total}] Q${result.id} ${status} - ${articles} - ${result.responseTime}ms`
  );

  if (!result.passed && result.errors) {
    console.log(`   Erreurs: ${result.errors.join(', ')}`);
  }
}

/**
 * Génère le rapport de test
 */
function generateReport(results: TestResult[]): TestReport {
  const byLevel: Record<TestLevel, { total: number; passed: number; rate: number }> = {
    green: { total: 0, passed: 0, rate: 0 },
    yellow: { total: 0, passed: 0, rate: 0 },
    red: { total: 0, passed: 0, rate: 0 },
    black: { total: 0, passed: 0, rate: 0 },
    blue: { total: 0, passed: 0, rate: 0 },
    chart: { total: 0, passed: 0, rate: 0 },
    target: { total: 0, passed: 0, rate: 0 },
  };

  for (const result of results) {
    byLevel[result.level].total++;
    if (result.passed) {
      byLevel[result.level].passed++;
    }
  }

  // Calculer les taux
  for (const level of Object.keys(byLevel) as TestLevel[]) {
    const { total, passed } = byLevel[level];
    byLevel[level].rate = total > 0 ? Math.round((passed / total) * 100) : 0;
  }

  const totalPassed = results.filter((r) => r.passed).length;

  return {
    timestamp: new Date().toISOString(),
    totalQuestions: results.length,
    passed: totalPassed,
    failed: results.length - totalPassed,
    successRate: Math.round((totalPassed / results.length) * 100),
    byLevel,
    results,
  };
}

/**
 * Affiche le rapport final
 */
function displayReport(report: TestReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('RAPPORT DE TEST CGI 242 - RAG');
  console.log('='.repeat(60));
  console.log(`Date: ${report.timestamp}`);
  console.log(`Total: ${report.totalQuestions} questions`);
  console.log(`Réussi: ${report.passed} (${report.successRate}%)`);
  console.log(`Échoué: ${report.failed}`);
  console.log('');

  console.log('RÉSULTATS PAR NIVEAU:');
  console.log('-'.repeat(60));

  for (const level of Object.keys(report.byLevel) as TestLevel[]) {
    const { total, passed, rate } = report.byLevel[level];
    if (total === 0) continue;

    const target = TARGET_RATES[level];
    const status = rate >= target ? '\x1b[32mOK\x1b[0m' : '\x1b[31mKO\x1b[0m';
    const bar = '█'.repeat(Math.floor(rate / 5)) + '░'.repeat(20 - Math.floor(rate / 5));

    console.log(`${LEVEL_NAMES[level]}`);
    console.log(`  ${bar} ${rate}% (${passed}/${total}) - Cible: ${target}% ${status}`);
  }

  console.log('');
  console.log('QUESTIONS ÉCHOUÉES:');
  console.log('-'.repeat(60));

  const failed = report.results.filter((r) => !r.passed);
  if (failed.length === 0) {
    console.log('Aucune question échouée !');
  } else {
    for (const result of failed.slice(0, 10)) {
      console.log(`Q${result.id}: ${result.question.substring(0, 60)}...`);
      console.log(`  Attendu: [${result.expectedArticles.join(', ')}]`);
      console.log(`  Trouvé: [${result.foundArticles.join(', ')}]`);
      if (result.errors) {
        console.log(`  Erreurs: ${result.errors.join(', ')}`);
      }
      console.log('');
    }
    if (failed.length > 10) {
      console.log(`... et ${failed.length - 10} autres questions échouées`);
    }
  }

  console.log('='.repeat(60));
}

/**
 * Sauvegarde le rapport en JSON
 */
function saveReport(report: TestReport): string {
  // Créer le dossier de sortie si nécessaire
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const filename = `test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(OUTPUT_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`Rapport sauvegardé: ${filepath}`);

  return filepath;
}

/**
 * Fonction principale
 */
async function main(): Promise<void> {
  // Parser les arguments
  const args = process.argv.slice(2);
  let questions = ALL_QUESTIONS;
  let levelFilter: TestLevel | null = null;

  for (const arg of args) {
    if (arg.startsWith('--level=')) {
      levelFilter = arg.split('=')[1] as TestLevel;
      if (QUESTIONS_BY_LEVEL[levelFilter]) {
        questions = QUESTIONS_BY_LEVEL[levelFilter];
      } else {
        console.error(`Niveau invalide: ${levelFilter}`);
        console.log('Niveaux disponibles: green, yellow, red, black, blue, chart, target');
        process.exit(1);
      }
    }
    if (arg === '--help') {
      console.log('Usage: npx ts-node run-all-tests.ts [options]');
      console.log('');
      console.log('Options:');
      console.log('  --level=LEVEL  Tester uniquement un niveau (green, yellow, red, black, blue, chart, target)');
      console.log('  --help         Afficher cette aide');
      process.exit(0);
    }
  }

  console.log('='.repeat(60));
  console.log('CGI 242 - TEST RAG AUTOMATISÉ');
  console.log('='.repeat(60));
  console.log(`Questions à tester: ${questions.length}`);
  if (levelFilter) {
    console.log(`Niveau filtré: ${LEVEL_NAMES[levelFilter]}`);
  }
  console.log('');

  const results: TestResult[] = [];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const result = await runSingleTest(question);
    results.push(result);

    showProgress(i + 1, questions.length, result);

    // Délai entre les tests pour éviter le rate limiting
    if (i < questions.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_TESTS));
    }
  }

  const report = generateReport(results);
  displayReport(report);
  saveReport(report);
}

// Exécution
main().catch(console.error);
