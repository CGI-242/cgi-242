// Re-export des types
export * from './cgi-types';

// Import des tomes 2025
import { CGI_TOME_1 } from './cgi-tome1.data';
import { CGI_TOME_2 } from './cgi-tome2.data';

// Import des conventions
import { CGI_CONVENTIONS_2025 } from './cgi-conventions.data';

// Import des tomes 2026
import { CGI_TOME_1_2026 } from './2026/cgi-tome1-2026.data';

import { Tome, Convention } from './cgi-types';

// Structure officielle du CGI 2025
export const CGI_SOMMAIRE_2025: Tome[] = [CGI_TOME_1, CGI_TOME_2];

// Conventions fiscales 2025
export const CGI_CONVENTIONS: Convention[] = CGI_CONVENTIONS_2025;

// Structure CGI 2026 (Directive CEMAC n°0119/25-UEAC-177-CM-42)
export const CGI_SOMMAIRE_2026: Tome[] = [CGI_TOME_1_2026];
