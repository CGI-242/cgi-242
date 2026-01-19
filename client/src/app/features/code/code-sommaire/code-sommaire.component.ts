import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CGI_SOMMAIRE_2025, CGI_SOMMAIRE_2026, CGI_CONVENTIONS, Tome, Chapitre, Section, Partie, Annexe, Livre, SousSection, SousSectionSommaire, Convention, ConventionChapitre } from './cgi-structure.data';

export interface SommaireSelection {
  type: 'tome' | 'partie' | 'livre' | 'chapitre' | 'section' | 'sous_section' | 'texte' | 'convention';
  path: string;
  titre: string;
  articles?: string; // Plage d'articles ex: "1-65 bis"
  tome?: number; // Numéro du tome pour filtrer correctement
  chapitreTitre?: string; // Titre du chapitre pour filtrer (ex: "Impôt sur le revenu des personnes physiques (IRPP)")
  sectionTitre?: string; // Titre de la section pour filtrer
  sousSections?: { titre: string; articles: string }[]; // Pour afficher les sous-sections comme séparateurs
}

@Component({
  selector: 'app-code-sommaire',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './code-sommaire.component.html',
  styleUrls: ['./code-sommaire.component.scss'],
})
export class CodeSommaireComponent {
  version = input<'2025' | '2026'>('2025');
  selection = output<SommaireSelection>();

  openNodes = signal<Set<string>>(new Set(['tome-1', 'partie-1-1', 'livre-1-1-1']));

  get sommaire(): Tome[] {
    return this.version() === '2026' ? CGI_SOMMAIRE_2026 : CGI_SOMMAIRE_2025;
  }

  get conventions(): Convention[] {
    return this.version() === '2025' ? CGI_CONVENTIONS : [];
  }

  isOpen(key: string): boolean {
    return this.openNodes().has(key);
  }

  toggle(key: string): void {
    this.openNodes.update(nodes => {
      const newNodes = new Set(nodes);
      if (newNodes.has(key)) {
        newNodes.delete(key);
      } else {
        newNodes.add(key);
      }
      return newNodes;
    });
  }

  onChapitreClick(chapitre: Chapitre, tomeNum?: number): void {
    this.selection.emit({
      type: 'chapitre',
      path: `Chapitre ${chapitre.chapitre}`,
      titre: chapitre.titre,
      articles: chapitre.articles,
      tome: tomeNum,
      chapitreTitre: chapitre.titre, // Pour filtrer par chapitre dans la DB
    });
  }

  onSectionClick(chapitre: Chapitre, section: Section, tomeNum?: number): void {
    // Préparer les sous-sections pour les afficher comme séparateurs
    const sousSections = section.sous_sections?.map(ss => ({
      titre: `${ss.sous_section}. ${ss.titre}`,
      articles: ss.articles || ''
    }));

    this.selection.emit({
      type: 'section',
      path: `Chapitre ${chapitre.chapitre}, Section ${section.section}`,
      titre: section.titre,
      articles: section.articles,
      tome: tomeNum,
      chapitreTitre: chapitre.titre, // Pour filtrer par chapitre dans la DB
      sectionTitre: section.titre, // Pour filtrer par section dans la DB
      sousSections,
    });
  }

  // Calcule les articles d'intro d'une section (avant la 1ère sous-section)
  private getIntroArticles(section: Section): string | undefined {
    if (!section.articles || !section.sous_sections || section.sous_sections.length === 0) {
      return section.articles;
    }
    // Extraire le début de la section
    const sectionMatch = section.articles.match(/^(\d+)/);
    if (!sectionMatch) return section.articles;
    const sectionStart = parseInt(sectionMatch[1], 10);

    // Trouver le début de la première sous-section
    const firstSousSection = section.sous_sections[0];
    if (!firstSousSection.articles) return section.articles;
    const sousSectionMatch = firstSousSection.articles.match(/^(\d+)/);
    if (!sousSectionMatch) return section.articles;
    const sousSectionStart = parseInt(sousSectionMatch[1], 10);

    // Si les articles d'intro existent (section commence avant sous-section)
    if (sectionStart < sousSectionStart) {
      return `${sectionStart}-${sousSectionStart - 1}`;
    }
    return section.articles;
  }

  onSousSectionClick(chapitre: Chapitre, section: Section, sousSection: SousSectionSommaire, tomeNum?: number): void {
    this.selection.emit({
      type: 'sous_section',
      path: `Chapitre ${chapitre.chapitre}, Section ${section.section}, §${sousSection.sous_section}`,
      titre: sousSection.titre,
      articles: sousSection.articles,
      tome: tomeNum,
    });
  }

  onPartieClick(partie: Partie): void {
    this.selection.emit({
      type: 'partie',
      path: `Partie ${partie.partie}`,
      titre: partie.titre,
      articles: partie.articles,
    });
  }

  onLivreClick(livre: Livre): void {
    this.selection.emit({
      type: 'livre',
      path: `Livre ${livre.livre}`,
      titre: livre.titre,
    });
  }

  onTexteClick(texte: SousSection): void {
    this.selection.emit({
      type: 'texte',
      path: texte.code,
      titre: texte.titre,
    });
  }

  onAnnexeClick(annexe: Annexe): void {
    this.selection.emit({
      type: 'partie',
      path: 'Annexes',
      titre: annexe.titre,
    });
  }

  onConventionClick(conv: Convention): void {
    this.selection.emit({
      type: 'convention',
      path: conv.code,
      titre: conv.titre,
      articles: conv.articles,
    });
  }

  onConventionChapitreClick(conv: Convention, chap: ConventionChapitre): void {
    this.selection.emit({
      type: 'convention',
      path: `${conv.code} - Chapitre ${chap.chapitre}`,
      titre: `${conv.titre} - ${chap.titre}`,
      articles: chap.articles,
    });
  }

  capitalizeFirst(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}
