import { Convention } from './cgi-types';

export const CGI_CONVENTIONS_2025: Convention[] = [
  {
    code: 'CEMAC',
    titre: 'Convention fiscale CEMAC',
    pays: 'CEMAC (Cameroun, Centrafrique, Congo, Gabon, Guinée Équatoriale, Tchad)',
    chapitres: [
      { chapitre: 1, titre: 'Champ d\'application de la convention', articles: 'CEMAC-1 à CEMAC-2' },
      { chapitre: 2, titre: 'Définitions générales', articles: 'CEMAC-3 à CEMAC-5' },
      { chapitre: 3, titre: 'Imposition des revenus', articles: 'CEMAC-6 à CEMAC-23' },
      { chapitre: 5, titre: 'Dispositions spéciales', articles: 'CEMAC-25 à CEMAC-30' },
      { chapitre: 6, titre: 'Dispositions finales', articles: 'CEMAC-31 à CEMAC-33' },
    ],
  },
  {
    code: 'FR',
    titre: 'Convention fiscale France-Congo',
    pays: 'France',
    articles: 'FR-1 à FR-15',
  },
  {
    code: 'CN',
    titre: 'Convention fiscale Chine-Congo',
    pays: 'Chine',
    articles: 'CN-1 à CN-29',
  },
];
