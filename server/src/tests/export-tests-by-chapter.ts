#!/usr/bin/env npx ts-node
// server/src/tests/export-tests-by-chapter.ts
// Exporte les questions de test en fichiers JSON séparés par chapitre

import * as fs from 'fs';
import * as path from 'path';

// Import des questions par chapitre
import { ALL_QUESTIONS as IRPP_2025 } from './test-questions-data';
import { IS_QUESTIONS } from './test-questions-is';
import { DC_QUESTIONS } from './test-questions-dc';
import { TD_QUESTIONS } from './test-questions-td';
import { DD_QUESTIONS } from './test-questions-dd';
import { PV_QUESTIONS } from './test-questions-pv';
import { IL_QUESTIONS } from './test-questions-il';
import { IS_2026_QUESTIONS } from './test-questions-is-2026';
import { IBA_2026_QUESTIONS } from './test-questions-iba-2026';

const OUTPUT_DIR = './test-results/par-chapitre';

interface ChapterExport {
  id: string;
  name: string;
  version: string;
  description: string;
  questions: any[];
}

const chapters: ChapterExport[] = [
  {
    id: 'chapitre1-irpp-2025',
    name: 'IRPP - Impot sur le Revenu des Personnes Physiques',
    version: 'CGI 2025',
    description: 'Chapitre 1 - Articles 1 a 105',
    questions: IRPP_2025,
  },
  {
    id: 'chapitre3-is-2025',
    name: 'IS - Impot sur les Societes',
    version: 'CGI 2025',
    description: 'Chapitre 3 - Articles 107 a 126',
    questions: IS_QUESTIONS,
  },
  {
    id: 'chapitre4-dispositions-communes-2025',
    name: 'Dispositions Communes',
    version: 'CGI 2025',
    description: 'Chapitre 4 - Dispositions communes aux impots directs',
    questions: DC_QUESTIONS,
  },
  {
    id: 'chapitre5-taxes-diverses-2025',
    name: 'Taxes Diverses',
    version: 'CGI 2025',
    description: 'Chapitre 5 - Taxes speciales et diverses',
    questions: TD_QUESTIONS,
  },
  {
    id: 'chapitre6-dispositions-diverses-2025',
    name: 'Dispositions Diverses',
    version: 'CGI 2025',
    description: 'Chapitre 6 - Autres dispositions fiscales',
    questions: DD_QUESTIONS,
  },
  {
    id: 'chapitre7-plus-values-2025',
    name: 'Plus-values, BTP, Reassurance',
    version: 'CGI 2025',
    description: 'Chapitre 7 - Plus-values titres, BTP, reassurance',
    questions: PV_QUESTIONS,
  },
  {
    id: 'partie2-impots-locaux-2025',
    name: 'Impots Locaux',
    version: 'CGI 2025',
    description: 'Partie 2 Titre 1 Chapitre 1 - Impots locaux',
    questions: IL_QUESTIONS,
  },
  {
    id: 'chapitre1-is-2026',
    name: 'IS - Impot sur les Societes',
    version: 'CGI 2026',
    description: 'Chapitre 1 - Articles 107 a 126 (version 2026)',
    questions: IS_2026_QUESTIONS,
  },
  {
    id: 'chapitre2-iba-2026',
    name: 'IBA, IRCM, IRF, ITS',
    version: 'CGI 2026',
    description: 'Chapitre 2 - Impots sur benefices agricoles, capitaux, fonciers, salaires',
    questions: IBA_2026_QUESTIONS,
  },
];

function exportChapters(): void {
  console.log('');
  console.log('='.repeat(60));
  console.log(' EXPORT DES TESTS PAR CHAPITRE');
  console.log('='.repeat(60));

  // Créer le dossier de sortie
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let totalQuestions = 0;

  for (const chapter of chapters) {
    const output = {
      meta: {
        id: chapter.id,
        name: chapter.name,
        version: chapter.version,
        description: chapter.description,
        totalQuestions: chapter.questions.length,
        exportDate: new Date().toISOString(),
      },
      questions: chapter.questions.map(q => ({
        id: q.id,
        level: q.level,
        category: q.category,
        question: q.question,
        expectedArticles: q.expectedArticles,
        acceptableArticles: q.acceptableArticles || [],
        mustContain: q.mustContain || [],
        mustNotContain: q.mustNotContain || [],
      })),
    };

    const filePath = path.join(OUTPUT_DIR, `${chapter.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2));

    console.log(`  ${chapter.id}.json - ${chapter.questions.length} questions`);
    totalQuestions += chapter.questions.length;
  }

  // Créer un fichier index
  const index = {
    title: 'Index des tests CGI par chapitre',
    exportDate: new Date().toISOString(),
    totalQuestions,
    chapters: chapters.map(c => ({
      id: c.id,
      name: c.name,
      version: c.version,
      questions: c.questions.length,
      file: `${c.id}.json`,
    })),
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify(index, null, 2));

  console.log('');
  console.log(`  index.json - Index global`);
  console.log('');
  console.log('='.repeat(60));
  console.log(`  TOTAL: ${totalQuestions} questions exportees`);
  console.log(`  Dossier: ${OUTPUT_DIR}/`);
  console.log('='.repeat(60));
}

exportChapters();
