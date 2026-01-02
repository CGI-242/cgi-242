// server/src/tests/test-questions-index.ts
// Index des questions de test pour tous les chapitres CGI

// Types communs
export { TestQuestion, TestLevel, TestResult, TestReport, checkContains } from './test-questions-data.js';

// ==================== CGI 2025 ====================

// IRPP (Chapitre 1) - 2025
export {
  ALL_QUESTIONS as IRPP_2025_QUESTIONS,
  QUESTIONS_BY_LEVEL as IRPP_2025_BY_LEVEL,
  QUICK_QUESTIONS as QUICK_IRPP_2025,
  TARGET_RATES,
  LEVEL_NAMES,
} from './test-questions-data.js';

// IS (Chapitre 3) - 2025
export {
  IS_QUESTIONS,
  IS_QUESTIONS_BY_LEVEL,
  QUICK_IS_QUESTIONS,
} from './test-questions-is.js';

// Dispositions Communes (Chapitre 4) - 2025
export {
  DC_QUESTIONS,
  DC_QUESTIONS_BY_LEVEL,
  DC_QUESTIONS_BY_SECTION,
  QUICK_DC_QUESTIONS,
} from './test-questions-dc.js';

// Taxes Diverses (Chapitre 5) - 2025
export {
  TD_QUESTIONS,
  TD_QUESTIONS_BY_LEVEL,
  TD_QUESTIONS_BY_SECTION,
  QUICK_TD_QUESTIONS,
} from './test-questions-td.js';

// Dispositions Diverses (Chapitre 6) - 2025
export {
  DD_QUESTIONS,
  DD_QUESTIONS_BY_LEVEL,
  DD_QUESTIONS_BY_SECTION,
  QUICK_DD_QUESTIONS,
} from './test-questions-dd.js';

// Plus-values, BTP, Reassurance (Chapitre 7) - 2025
export {
  PV_QUESTIONS,
  PV_QUESTIONS_BY_LEVEL,
  PV_QUESTIONS_BY_SECTION,
  QUICK_PV_QUESTIONS,
} from './test-questions-pv.js';

// Impots Locaux (Partie 2 Titre 1 Chapitre 1) - 2025
export {
  IL_QUESTIONS,
  IL_QUESTIONS_BY_LEVEL,
  IL_QUESTIONS_BY_SECTION,
  QUICK_IL_QUESTIONS,
} from './test-questions-il.js';

// ==================== CGI 2026 ====================

// IS (Chapitre 1) - 2026
export {
  IS_2026_QUESTIONS,
  IS_2026_QUESTIONS_BY_LEVEL,
  QUICK_IS_2026_QUESTIONS,
} from './test-questions-is-2026.js';

// IBA/IRCM/IRF/ITS (Chapitre 2) - 2026
export {
  IBA_2026_QUESTIONS,
  IBA_2026_QUESTIONS_BY_LEVEL,
  IBA_2026_QUESTIONS_BY_SECTION,
  QUICK_IBA_2026_QUESTIONS,
} from './test-questions-iba-2026.js';

// ==================== GROUPES PAR VERSION ====================

import { ALL_QUESTIONS as IRPP_2025 } from './test-questions-data.js';
import { IS_QUESTIONS } from './test-questions-is.js';
import { DC_QUESTIONS } from './test-questions-dc.js';
import { TD_QUESTIONS } from './test-questions-td.js';
import { DD_QUESTIONS } from './test-questions-dd.js';
import { PV_QUESTIONS } from './test-questions-pv.js';
import { IL_QUESTIONS } from './test-questions-il.js';
import { IS_2026_QUESTIONS } from './test-questions-is-2026.js';
import { IBA_2026_QUESTIONS } from './test-questions-iba-2026.js';

export const ALL_2025_QUESTIONS = [...IRPP_2025, ...IS_QUESTIONS, ...DC_QUESTIONS, ...TD_QUESTIONS, ...DD_QUESTIONS, ...PV_QUESTIONS, ...IL_QUESTIONS];
export const ALL_2026_QUESTIONS = [...IS_2026_QUESTIONS, ...IBA_2026_QUESTIONS];
export const ALL_CGI_QUESTIONS = [...ALL_2025_QUESTIONS, ...ALL_2026_QUESTIONS];

// ==================== STATS ====================

export const TEST_STATS = {
  '2025': {
    irpp: IRPP_2025.length,
    is: IS_QUESTIONS.length,
    dc: DC_QUESTIONS.length,
    td: TD_QUESTIONS.length,
    dd: DD_QUESTIONS.length,
    pv: PV_QUESTIONS.length,
    il: IL_QUESTIONS.length,
    total: IRPP_2025.length + IS_QUESTIONS.length + DC_QUESTIONS.length + TD_QUESTIONS.length + DD_QUESTIONS.length + PV_QUESTIONS.length + IL_QUESTIONS.length,
  },
  '2026': {
    is: IS_2026_QUESTIONS.length,
    iba: IBA_2026_QUESTIONS.length,
    total: IS_2026_QUESTIONS.length + IBA_2026_QUESTIONS.length,
  },
  total: ALL_2025_QUESTIONS.length + ALL_2026_QUESTIONS.length,
};
