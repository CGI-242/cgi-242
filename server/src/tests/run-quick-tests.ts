#!/usr/bin/env npx ts-node
// server/src/tests/run-quick-tests.ts
// Script de test rapide du RAG CGI 242 (10 questions clés)

import { agent2025 } from '../agents/agent-2025.js';
import {
  QUICK_QUESTIONS,
  TARGET_RATES,
  LEVEL_NAMES,
  TestQuestion,
  TestResult,
  TestLevel,
} from './test-questions-data.js';

// Configuration
const DELAY_BETWEEN_TESTS = 500; // 500ms entre chaque test

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
 * Vérifie si les articles attendus sont présents
 */
function checkArticleMatch(expected: string[], found: string[]): boolean {
  if (expected.length === 0) return true;

  const normalizedExpected = expected.map(normalizeArticle);
  const normalizedFound = found.map(normalizeArticle);

  return normalizedExpected.some((exp) =>
    normalizedFound.some((f) => f.includes(exp) || exp.includes(f))
  );
}

/**
 * Vérifie si le contenu attendu est présent
 */
function checkContentMatch(
  response: string,
  mustContain?: string[],
  mustNotContain?: string[]
): boolean {
  const lowerResponse = response.toLowerCase();

  if (mustContain) {
    for (const term of mustContain) {
      const alternatives = term.split('|').map((t) => t.trim().toLowerCase());
      const found = alternatives.some((alt) => lowerResponse.includes(alt));
      if (!found) return false;
    }
  }

  if (mustNotContain) {
    for (const term of mustNotContain) {
      if (lowerResponse.includes(term.toLowerCase())) return false;
    }
  }

  return true;
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
    const articleMatch = checkArticleMatch(question.expectedArticles, foundArticles);
    const contentMatch = checkContentMatch(
      response.answer,
      question.mustContain,
      question.mustNotContain
    );

    return {
      id: question.id,
      question: question.question,
      level: question.level,
      passed: articleMatch && contentMatch,
      expectedArticles: question.expectedArticles,
      foundArticles,
      articleMatch,
      contentMatch,
      response: response.answer,
      responseTime,
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
 * Affiche le résultat d'un test
 */
function showResult(index: number, total: number, result: TestResult): void {
  const status = result.passed
    ? '\x1b[32m PASS \x1b[0m'
    : '\x1b[31m FAIL \x1b[0m';

  const expected = result.expectedArticles.length > 0
    ? `Art. ${result.expectedArticles.join(', ')}`
    : 'N/A';

  const found = result.foundArticles.length > 0
    ? result.foundArticles.slice(0, 2).join(', ')
    : 'aucun';

  console.log(
    `[${index}/${total}]${status} Q${result.id.toString().padStart(2)} | ` +
    `Attendu: ${expected.padEnd(15)} | Trouvé: ${found.padEnd(10)} | ${result.responseTime}ms`
  );
}

/**
 * Fonction principale
 */
async function main(): Promise<void> {
  console.log('');
  console.log('='.repeat(70));
  console.log(' CGI 242 - TEST RAPIDE (10 questions clés)');
  console.log('='.repeat(70));
  console.log('');

  const results: TestResult[] = [];
  const questions = QUICK_QUESTIONS;

  for (let i = 0; i < questions.length; i++) {
    const result = await runSingleTest(questions[i]);
    results.push(result);
    showResult(i + 1, questions.length, result);

    if (i < questions.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_TESTS));
    }
  }

  // Résumé
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const rate = Math.round((passed / results.length) * 100);

  console.log('');
  console.log('='.repeat(70));
  console.log(' RÉSUMÉ');
  console.log('='.repeat(70));
  console.log(`  Total:   ${results.length} questions`);
  console.log(`  Réussi:  ${passed} (${rate}%)`);
  console.log(`  Échoué:  ${failed}`);
  console.log('');

  // Barre de progression visuelle
  const bar = '█'.repeat(Math.floor(rate / 5)) + '░'.repeat(20 - Math.floor(rate / 5));
  console.log(`  [${bar}] ${rate}%`);
  console.log('');

  // Statut final
  if (rate >= 80) {
    console.log('  \x1b[32m✓ RAG fonctionnel\x1b[0m');
  } else if (rate >= 60) {
    console.log('  \x1b[33m⚠ RAG partiellement fonctionnel\x1b[0m');
  } else {
    console.log('  \x1b[31m✗ RAG défaillant - investigation requise\x1b[0m');
  }

  console.log('');
  console.log('='.repeat(70));

  // Code de sortie basé sur le taux de réussite
  process.exit(rate >= 80 ? 0 : 1);
}

// Exécution
main().catch(console.error);
