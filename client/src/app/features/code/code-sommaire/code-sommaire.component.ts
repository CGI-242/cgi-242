import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CGI_SOMMAIRE_2025, CGI_SOMMAIRE_2026, Tome, Chapitre, Section, Partie, Annexe, Livre, SousSection, SousSectionSommaire } from './cgi-structure.data';

export interface SommaireSelection {
  type: 'tome' | 'partie' | 'livre' | 'chapitre' | 'section' | 'sous_section' | 'texte';
  path: string;
  titre: string;
  articles?: string; // Plage d'articles ex: "1-65 bis"
}

@Component({
  selector: 'app-code-sommaire',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="divide-y divide-secondary-100">
      @for (tome of sommaire; track tome.tome) {
        <div>
          <button
            (click)="toggle('tome-' + tome.tome)"
            class="w-full text-left p-3 hover:bg-secondary-50 flex items-center gap-2 whitespace-nowrap overflow-hidden">
            <svg class="w-4 h-4 text-secondary-400 transition-transform flex-shrink-0"
              [class.rotate-90]="isOpen('tome-' + tome.tome)"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            <span class="font-semibold text-sm text-secondary-900 flex-shrink-0">Tome {{ tome.tome }}:</span>
            <span class="text-xs text-secondary-500 truncate">{{ tome.titre }}</span>
          </button>

          @if (isOpen('tome-' + tome.tome)) {
            <div class="ml-4 border-l border-secondary-200">
              <!-- Parties (Tome 1) -->
              @if (tome.parties) {
                @for (partie of tome.parties; track partie.partie) {
                  <div>
                    @if (partie.simple) {
                      <button
                        (click)="onPartieClick(partie)"
                        class="w-full text-left p-2 pl-4 hover:bg-secondary-50 flex items-center gap-2 overflow-hidden">
                        <span class="w-3 h-3 flex-shrink-0"></span>
                        <span class="text-xs font-medium text-secondary-700 flex-shrink-0">Partie {{ partie.partie }}:</span>
                        <span class="text-xs text-secondary-700 truncate">{{ partie.titre }}</span>
                      </button>
                    } @else {
                      <button
                        (click)="toggle('partie-' + tome.tome + '-' + partie.partie)"
                        class="w-full text-left p-2 pl-4 hover:bg-secondary-50 flex items-center gap-2 overflow-hidden">
                        <svg class="w-3 h-3 text-secondary-400 transition-transform flex-shrink-0"
                          [class.rotate-90]="isOpen('partie-' + tome.tome + '-' + partie.partie)"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                        <span class="text-xs font-medium text-secondary-700 flex-shrink-0">Partie {{ partie.partie }}:</span>
                        <span class="text-xs text-secondary-700 truncate">{{ partie.titre }}</span>
                      </button>
                    }

                    @if (isOpen('partie-' + tome.tome + '-' + partie.partie) && !partie.simple) {
                      <div class="ml-4">
                        <!-- Livres dans Partie -->
                        @if (partie.livres) {
                          @for (livre of partie.livres; track livre.livre) {
                            <ng-container *ngTemplateOutlet="livreTemplate; context: { livre: livre, prefix: 'partie-' + tome.tome + '-' + partie.partie }" />
                          }
                        }
                        <!-- Titres (Partie 2, 3) -->
                        @if (partie.titres) {
                          @for (titreItem of partie.titres; track titreItem.titre) {
                            <div>
                              <button
                                (click)="toggle('titre-' + tome.tome + '-' + partie.partie + '-' + titreItem.titre)"
                                class="w-full text-left p-2 pl-4 hover:bg-secondary-50 flex items-center gap-2">
                                <svg class="w-3 h-3 text-secondary-400 transition-transform"
                                  [class.rotate-90]="isOpen('titre-' + tome.tome + '-' + partie.partie + '-' + titreItem.titre)"
                                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                                <span class="text-xs text-secondary-600 truncate">Titre {{ titreItem.titre }}: {{ titreItem.titre_libelle }}</span>
                              </button>
                              @if (isOpen('titre-' + tome.tome + '-' + partie.partie + '-' + titreItem.titre)) {
                                <ng-container *ngTemplateOutlet="chapitresTemplate; context: { chapitres: titreItem.chapitres }" />
                              }
                            </div>
                          }
                        }
                      </div>
                    }
                  </div>
                }
              }

              <!-- Livres directs (Tome 2) -->
              @if (tome.livres) {
                @for (livre of tome.livres; track livre.livre) {
                  <ng-container *ngTemplateOutlet="livreTemplate; context: { livre: livre, prefix: 'tome-' + tome.tome }" />
                }
              }

              <!-- Sections non codifiées (Tome 2) -->
              @if (tome.sectionsNonCodifiees) {
                <div class="mt-2 pt-2 border-t border-secondary-200">
                  <div class="px-4 py-1">
                    <span class="text-xs font-semibold text-secondary-500 uppercase">Textes fiscaux non codifiés</span>
                  </div>
                  @for (sectionNC of tome.sectionsNonCodifiees; track sectionNC.section) {
                    <div>
                      <button
                        (click)="toggle('sectionNC-' + tome.tome + '-' + sectionNC.section)"
                        class="w-full text-left p-2 pl-4 hover:bg-secondary-50 flex items-center gap-2">
                        <svg class="w-3 h-3 text-secondary-400 transition-transform"
                          [class.rotate-90]="isOpen('sectionNC-' + tome.tome + '-' + sectionNC.section)"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                        <span class="text-xs font-medium text-secondary-700">{{ sectionNC.section }}. {{ sectionNC.titre }}</span>
                      </button>
                      @if (isOpen('sectionNC-' + tome.tome + '-' + sectionNC.section) && sectionNC.contenu) {
                        <div class="ml-6">
                          @for (item of sectionNC.contenu; track item.code) {
                            <div>
                              @if (item.details && item.details.length > 0) {
                                <button
                                  (click)="toggle('texte-' + item.code)"
                                  class="w-full text-left p-1.5 pl-3 hover:bg-secondary-50 flex items-center gap-2">
                                  <svg class="w-2.5 h-2.5 text-secondary-400 transition-transform"
                                    [class.rotate-90]="isOpen('texte-' + item.code)"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                  </svg>
                                  <span class="text-xs text-secondary-600">{{ item.code }} {{ item.titre }}</span>
                                </button>
                                @if (isOpen('texte-' + item.code)) {
                                  <div class="ml-4">
                                    @for (detail of item.details; track detail.code) {
                                      <button
                                        (click)="onTexteClick(detail)"
                                        class="w-full text-left p-1 pl-3 hover:bg-primary-50 text-xs text-secondary-500">
                                        {{ detail.code }} {{ detail.titre }}
                                      </button>
                                    }
                                  </div>
                                }
                              } @else {
                                <button
                                  (click)="onTexteClick(item)"
                                  class="w-full text-left p-1.5 pl-3 hover:bg-primary-50 text-xs text-secondary-600">
                                  {{ item.code }} {{ item.titre }}
                                </button>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Annexes -->
              @if (tome.annexes) {
                <div>
                  <button
                    (click)="onAnnexeClick(tome.annexes)"
                    class="w-full text-left p-2 pl-4 hover:bg-secondary-50 flex items-center gap-2">
                    <span class="w-3 h-3"></span>
                    <span class="text-xs font-medium text-secondary-700">{{ tome.annexes.titre }}</span>
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>

    <!-- Template réutilisable pour les livres -->
    <ng-template #livreTemplate let-livre="livre" let-prefix="prefix">
      <div>
        @if (livre.chapitres && livre.chapitres.length > 0) {
          <button
            (click)="toggle('livre-' + prefix + '-' + livre.livre)"
            class="w-full text-left p-2 pl-4 hover:bg-secondary-50 flex items-center gap-2"
            [class.opacity-50]="livre.statut === 'abrogé'">
            <svg class="w-3 h-3 text-secondary-400 transition-transform"
              [class.rotate-90]="isOpen('livre-' + prefix + '-' + livre.livre)"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            <span class="text-xs text-secondary-600 truncate">Livre {{ livre.livre }}: {{ livre.titre }}</span>
            @if (livre.statut === 'abrogé') {
              <span class="text-red-500 text-xs">(abrogé)</span>
            }
          </button>
          @if (isOpen('livre-' + prefix + '-' + livre.livre)) {
            <ng-container *ngTemplateOutlet="chapitresTemplate; context: { chapitres: livre.chapitres }" />
          }
        } @else {
          <button
            (click)="onLivreClick(livre)"
            class="w-full text-left p-2 pl-4 hover:bg-primary-50 flex items-center gap-2"
            [class.opacity-50]="livre.statut === 'abrogé'">
            <span class="w-3 h-3"></span>
            <span class="text-xs text-secondary-600 truncate">Livre {{ livre.livre }}: {{ livre.titre }}</span>
            @if (livre.statut === 'abrogé') {
              <span class="text-red-500 text-xs">(abrogé)</span>
            }
          </button>
        }
      </div>
    </ng-template>

    <!-- Template réutilisable pour les chapitres -->
    <ng-template #chapitresTemplate let-chapitres="chapitres">
      <div class="ml-4">
        @for (chapitre of chapitres; track chapitre.chapitre) {
          <div>
            <button
              (click)="onChapitreClick(chapitre)"
              class="w-full text-left p-2 pl-4 hover:bg-primary-50 text-xs"
              [class.opacity-50]="chapitre.statut === 'abrogé'">
              <span class="font-medium text-primary-700">Chap. {{ chapitre.chapitre }}</span>
              <span class="text-secondary-600 ml-1">{{ capitalizeFirst(chapitre.titre) }}</span>
              @if (chapitre.statut === 'abrogé') {
                <span class="ml-1 text-red-500">(abrogé)</span>
              }
            </button>
            @if (chapitre.sections && chapitre.sections.length > 0) {
              <div class="ml-6 border-l border-secondary-100">
                @for (section of chapitre.sections; track section.section) {
                  <div>
                    @if (section.sous_sections && section.sous_sections.length > 0) {
                      <button
                        (click)="toggle('section-' + chapitre.chapitre + '-' + section.section)"
                        class="w-full text-left p-1.5 pl-3 hover:bg-secondary-50 text-xs flex items-center gap-1"
                        [class.opacity-50]="section.statut === 'abrogé'">
                        <svg class="w-2.5 h-2.5 text-secondary-400 transition-transform flex-shrink-0"
                          [class.rotate-90]="isOpen('section-' + chapitre.chapitre + '-' + section.section)"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                        <span class="text-secondary-500">Sec. {{ section.section }}: {{ capitalizeFirst(section.titre) }}</span>
                        @if (section.articles) {
                          <span class="text-secondary-400 text-[10px] ml-1">(Art. {{ section.articles }})</span>
                        }
                        @if (section.statut === 'abrogé') {
                          <span class="text-red-500 ml-1">(abrogé)</span>
                        }
                      </button>
                      @if (isOpen('section-' + chapitre.chapitre + '-' + section.section)) {
                        <div class="ml-4 border-l border-secondary-100">
                          @for (sousSection of section.sous_sections; track sousSection.sous_section) {
                            <button
                              (click)="onSousSectionClick(chapitre, section, sousSection)"
                              class="w-full text-left p-1 pl-3 hover:bg-primary-50 text-xs text-secondary-400"
                              [class.opacity-50]="sousSection.statut === 'abrogé'">
                              <span class="font-medium">§{{ sousSection.sous_section }}</span>
                              <span class="ml-1">{{ capitalizeFirst(sousSection.titre) }}</span>
                              @if (sousSection.articles) {
                                <span class="text-secondary-300 text-[10px] ml-1">(Art. {{ sousSection.articles }})</span>
                              }
                              @if (sousSection.statut === 'abrogé') {
                                <span class="text-red-500 ml-1">(abrogé)</span>
                              }
                            </button>
                          }
                        </div>
                      }
                    } @else {
                      <button
                        (click)="onSectionClick(chapitre, section)"
                        class="w-full text-left p-1.5 pl-3 hover:bg-primary-50 text-xs text-secondary-500"
                        [class.opacity-50]="section.statut === 'abrogé'">
                        Sec. {{ section.section }}: {{ capitalizeFirst(section.titre) }}
                        @if (section.articles) {
                          <span class="text-secondary-400 text-[10px] ml-1">(Art. {{ section.articles }})</span>
                        }
                        @if (section.statut === 'abrogé') {
                          <span class="text-red-500">(abrogé)</span>
                        }
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class CodeSommaireComponent {
  @Input() version: '2025' | '2026' = '2025';
  @Output() selection = new EventEmitter<SommaireSelection>();

  openNodes = signal<Set<string>>(new Set(['tome-1', 'partie-1-1', 'livre-1-1-1']));

  get sommaire(): Tome[] {
    return this.version === '2026' ? CGI_SOMMAIRE_2026 : CGI_SOMMAIRE_2025;
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

  onChapitreClick(chapitre: Chapitre): void {
    this.selection.emit({
      type: 'chapitre',
      path: `Chapitre ${chapitre.chapitre}`,
      titre: chapitre.titre,
      articles: chapitre.articles,
    });
  }

  onSectionClick(chapitre: Chapitre, section: Section): void {
    this.selection.emit({
      type: 'section',
      path: `Chapitre ${chapitre.chapitre}, Section ${section.section}`,
      titre: section.titre,
      articles: section.articles,
    });
  }

  onSousSectionClick(chapitre: Chapitre, section: Section, sousSection: SousSectionSommaire): void {
    this.selection.emit({
      type: 'sous_section',
      path: `Chapitre ${chapitre.chapitre}, Section ${section.section}, §${sousSection.sous_section}`,
      titre: sousSection.titre,
      articles: sousSection.articles,
    });
  }

  onPartieClick(partie: Partie): void {
    this.selection.emit({
      type: 'partie',
      path: `Partie ${partie.partie}`,
      titre: partie.titre,
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

  capitalizeFirst(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}
