export interface Paragraphe {
  numero: number | string;
  titre: string;
  articles: string;
}

export interface SousSectionSommaire {
  sous_section: number | string;
  display?: string; // Affichage alternatif (ex: '3 bis' pour sous_section: 3.5)
  titre: string;
  articles?: string;
  statut?: string;
  paragraphes?: Paragraphe[];
}

export interface Section {
  section: number | string; // Peut être '2 bis', '2 ter', '2 quater', etc.
  titre: string;
  display?: string; // Affichage alternatif (ex: '2.1' au lieu de 'Sec. 1')
  page?: number;
  statut?: string;
  articles?: string; // Plage d'articles ex: "1-65 bis"
  sous_sections?: SousSectionSommaire[];
  paragraphes?: Paragraphe[];
}

export interface Chapitre {
  chapitre: number;
  titre: string;
  page?: number;
  statut?: string;
  articles?: string; // Plage d'articles ex: "1-118"
  sections?: Section[];
}

export interface Livre {
  livre: number;
  titre: string;
  page?: number;
  statut?: string;
  note?: string;
  articles?: string; // Plage d'articles pour livres sans chapitres
  chapitres?: Chapitre[];
}

export interface Titre {
  titre: number;
  titre_libelle: string;
  chapitres: Chapitre[];
}

export interface Partie {
  partie: number;
  titre: string;
  livres?: Livre[];
  titres?: Titre[];
  simple?: boolean;
  articles?: string; // Plage d'articles pour parties simples ex: "521-526"
}

export interface Annexe {
  titre: string;
  page?: number;
  tomeId?: string; // Ex: "ANNEXES-1" pour filtrer les articles des annexes
}

export interface SousSection {
  code: string;
  titre: string;
  page?: number;
  details?: SousSection[];
}

export interface SectionNonCodifiee {
  section: number;
  titre: string;
  page?: number;
  contenu?: SousSection[];
}

export interface Tome {
  tome: number;
  titre: string;
  parties?: Partie[];
  livres?: Livre[];
  sectionsNonCodifiees?: SectionNonCodifiee[];
  annexes?: Annexe;
}

export interface ConventionChapitre {
  chapitre: number;
  titre: string;
  articles?: string;
}

export interface Convention {
  code: string; // CEMAC, FR, CN
  titre: string;
  pays?: string;
  chapitres?: ConventionChapitre[];
  articles?: string;
}
