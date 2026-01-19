import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Pipe pour formater le contenu des articles du CGI
 * Transforme le texte brut en HTML structuré avec mise en forme
 *
 * SÉCURITÉ: bypassSecurityTrustHtml est utilisé de manière sécurisée car:
 * 1. Le contenu provient de la DB (articles CGI), pas d'input utilisateur
 * 2. Tous les caractères HTML sont échappés AVANT le formatage
 * 3. Seul du HTML prédéfini et contrôlé est ajouté
 */
@Pipe({
  name: 'articleFormat',
  standalone: true,
})
export class ArticleFormatPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(contenu: string): SafeHtml {
    if (!contenu) return '';

    // Diviser le contenu en lignes pour traiter chaque ligne
    const lines = contenu.split('\n');
    let formattedLines = lines.map(line => this.formatLine(line));

    // Appliquer l'italique aux blocs entre crochets [...]
    formattedLines = this.applyBracketBlocks(formattedLines);

    let html = formattedLines.join('');

    // Formater les notes NB entre crochets en italique
    html = html.replace(/\[NB-([^\]]+)\]/g, '<em class="text-secondary-500 italic">[NB-$1]</em>');

    // Envelopper le tout
    html = '<div class="mt-2">' + html + '</div>';

    // Nettoyer les divs de texte vides (mais garder les espacements mt-4)
    html = html.replace(/<div class="mt-2"><\/div>/g, '');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Formate une ligne individuelle
   */
  private formatLine(line: string): string {
    // Échapper les caractères HTML
    const escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    // Formater "1) a)" directement
    if (/^(\d+)\)[ \t]*([a-z])\)[ \t]*(.*)$/.test(escaped)) {
      return escaped.replace(/^(\d+)\)[ \t]*([a-z])\)[ \t]*(.*)$/,
        '<div class="mt-6 mb-2 flex items-start gap-2"><span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex-shrink-0">$1</span></div><div class="ml-10 mt-2 mb-1 flex items-start gap-2"><span class="font-semibold text-primary-600 flex-shrink-0">$2)</span><span>$3</span></div>');
    }

    // Formater les numéros seuls (1), 2), etc.)
    if (/^(\d+)\)[ \t]*/.test(escaped)) {
      return escaped.replace(/^(\d+)\)[ \t]*(.*)$/,
        '<div class="mt-6 mb-2 flex items-start gap-2"><span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm flex-shrink-0">$1</span><span>$2</span></div>');
    }

    // Formater les lettres a), b), etc.
    if (/^([a-z])\)[ \t]*/.test(escaped)) {
      return escaped.replace(/^([a-z])\)[ \t]*(.*)$/,
        '<div class="ml-10 mt-2 mb-1 flex items-start gap-2"><span class="font-semibold text-primary-600 flex-shrink-0">$1)</span><span>$2</span></div>');
    }

    // Formater les sous-numéros 1°, 2°, etc.
    if (/^(\d+)°[ \t]*/.test(escaped)) {
      return escaped.replace(/^(\d+)°[ \t]*(.*)$/,
        '<div class="ml-14 mt-2 pl-4 border-l-2 border-secondary-200 flex items-start gap-2"><span class="font-medium text-secondary-700 flex-shrink-0">$1°</span><span>$2</span></div>');
    }

    // Formater les tirets en liste
    if (/^[-–—][ \t]*/.test(escaped)) {
      return escaped.replace(/^[-–—][ \t]*(.*)$/,
        '<div class="ml-6 mt-1 flex items-start gap-2"><span class="text-primary-500 flex-shrink-0">•</span><span>$1</span></div>');
    }

    // Formater les sous-bullets (• avec indentation)
    if (/^[ \t]+[•·][ \t]*/.test(escaped)) {
      return escaped.replace(/^[ \t]+[•·][ \t]*(.*)$/,
        '<div class="ml-12 mt-1 flex items-start gap-2"><span class="text-secondary-400 flex-shrink-0">○</span><span>$1</span></div>');
    }

    // Formater les bullets sans indentation
    if (/^[•·][ \t]*/.test(escaped)) {
      return escaped.replace(/^[•·][ \t]*(.*)$/,
        '<div class="ml-6 mt-1 flex items-start gap-2"><span class="text-primary-500 flex-shrink-0">•</span><span>$1</span></div>');
    }

    // Ligne vide = espacement
    if (escaped.trim() === '') {
      return '<div class="mt-4"></div>';
    }

    // Formater les NB et Arrêté Art. en italique
    if (/^(\[?NB\s*\d*\s*-|Arrêté Art\.)/.test(escaped) || /\]$/.test(escaped)) {
      return '<div class="mt-2 italic text-secondary-600 border-l-2 border-secondary-300 pl-3">' + escaped + '</div>';
    }

    // Ligne normale (texte de continuation)
    return '<div class="mt-2">' + escaped + '</div>';
  }

  /**
   * Applique l'italique aux blocs entre crochets [...]
   */
  private applyBracketBlocks(lines: string[]): string[] {
    let inBracketBlock = false;

    return lines.map(line => {
      // Détecte le début d'un bloc [NB...]
      if (line.includes('[NB')) {
        inBracketBlock = true;
        return line;
      }

      // Détecte la fin d'un bloc (ligne se terminant par ])
      if (inBracketBlock && line.includes(']</div>')) {
        inBracketBlock = false;
        return line;
      }

      // Appliquer italique aux lignes dans le bloc [...]
      if (inBracketBlock && !line.includes('italic') && !line.includes('mt-4')) {
        return line.replace(/<div class="([^"]*)">/,
          '<div class="$1 italic text-secondary-600 border-l-2 border-secondary-300 pl-3">');
      }

      return line;
    });
  }
}
