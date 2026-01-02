#!/usr/bin/env npx ts-node
// server/src/tests/run-il-tests.ts
// Script de test pour les Impôts Locaux (Partie 2 Titre 1 Chapitre 1) - CGI 2025

import { agent2025 } from '../agents/agent-2025.js';
import {
  IL_QUESTIONS,
  IL_QUESTIONS_BY_LEVEL,
  QUICK_IL_QUESTIONS,
  IL_STATS,
} from './test-questions-il.js';
import {
  TestQuestion,
  TestResult,
  TestReport,
  TestLevel,
  TARGET_RATES,
  LEVEL_NAMES,
} from './test-questions-data.js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const DELAY_BETWEEN_TESTS = 1000;
const OUTPUT_DIR = './test-results';

function normalizeArticle(article: string): string {
  return article
    .replace(/^Art\.?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

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

function articleMatches(expected: string, actual: string): boolean {
  const expNorm = expected.replace(/^art\.?\s*/i, '').toLowerCase().trim();
  const actNorm = actual.replace(/^art\.?\s*/i, '').toLowerCase().trim();

  if (expNorm === actNorm) return true;

  const expBase = expNorm.replace(/[-\s]?[a-z]$/i, '').replace(/-\d+$/, '');
  const actBase = actNorm.replace(/[-\s]?[a-z]$/i, '').replace(/-\d+$/, '');

  if (expBase === actBase) return true;
  if (expBase === actNorm || actBase === expNorm) return true;
  if (actNorm.startsWith(expBase) || expNorm.startsWith(actBase)) return true;

  return false;
}

function checkArticleMatch(expected: string[], found: string[], acceptable?: string[]): boolean {
  if (expected.length === 0) return true;
  const allAccepted = [...expected, ...(acceptable || [])];
  return allAccepted.some((exp) => found.some((f) => articleMatches(exp, f)));
}

function checkContentMatch(
  response: string,
  mustContain?: string[],
  mustNotContain?: string[]
): { passed: boolean; errors: string[] } {
  const errors: string[] = [];
  const lowerResponse = response.toLowerCase();

  if (mustContain) {
    for (const term of mustContain) {
      const alternatives = term.split('|').map((t) => t.trim().toLowerCase());
      const found = alternatives.some((alt) => lowerResponse.includes(alt));
      if (!found) {
        errors.push(`Terme manquant: "${term}"`);
      }
    }
  }

  if (mustNotContain) {
    for (const term of mustNotContain) {
      if (lowerResponse.includes(term.toLowerCase())) {
        errors.push(`Terme interdit présent: "${term}"`);
      }
    }
  }

  return { passed: errors.length === 0, errors };
}

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

function showProgress(current: number, total: number, result: TestResult): void {
  const status = result.passed ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  const articles = result.foundArticles.length > 0
    ? `[${result.foundArticles.slice(0, 3).join(', ')}]`
    : '[aucun]';

  console.log(`[${current}/${total}] Q${result.id} ${status} - ${articles} - ${result.responseTime}ms`);
}

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
    if (result.passed) byLevel[result.level].passed++;
  }

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

function displayReport(report: TestReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('RAPPORT DE TEST - IMPÔTS LOCAUX (CGI 2025)');
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

    const target = TARGET_RATES[level] || 70;
    const status = rate >= target ? '\x1b[32mOK\x1b[0m' : '\x1b[31mKO\x1b[0m';
    const bar = '█'.repeat(Math.floor(rate / 5)) + '░'.repeat(20 - Math.floor(rate / 5));

    console.log(`${LEVEL_NAMES[level] || level}`);
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
  }

  console.log('='.repeat(60));
}

function saveReport(report: TestReport): string {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const filename = `test-report-IL-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`Rapport sauvegardé: ${filepath}`);

  return filepath;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let questions = IL_QUESTIONS;
  let testName = 'COMPLET';

  for (const arg of args) {
    if (arg === '--quick') {
      questions = QUICK_IL_QUESTIONS;
      testName = 'RAPIDE';
    }
    if (arg === '--help') {
      console.log('Usage: npx tsx run-il-tests.ts [options]');
      console.log('');
      console.log('Options:');
      console.log('  --quick   Test rapide (6 questions, 1 par section)');
      console.log('  --help    Afficher cette aide');
      console.log('');
      console.log(`Stats: ${IL_STATS.total} questions`);
      console.log(`  - Green: ${IL_STATS.par_niveau.green}`);
      console.log(`  - Yellow: ${IL_STATS.par_niveau.yellow}`);
      console.log(`  - Red: ${IL_STATS.par_niveau.red}`);
      process.exit(0);
    }
  }

  console.log('='.repeat(60));
  console.log(`TEST RAG - IMPÔTS LOCAUX (${testName})`);
  console.log('='.repeat(60));
  console.log(`CFPB, CFPNB, Patente, Taxe régionale, Spectacles`);
  console.log(`Questions à tester: ${questions.length}`);
  console.log('');

  const results: TestResult[] = [];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const result = await runSingleTest(question);
    results.push(result);
    showProgress(i + 1, questions.length, result);

    if (i < questions.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_TESTS));
    }
  }

  const report = generateReport(results);
  displayReport(report);
  saveReport(report);
}

main().catch(console.error);
