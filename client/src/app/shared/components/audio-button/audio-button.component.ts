import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonSize = 'small' | 'default' | 'large';

@Component({
  selector: 'app-audio-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="handleSpeak()"
      class="flex items-center gap-2 rounded-lg transition-colors"
      [ngClass]="getSizeClasses()"
      [class.text-gray-600]="!isPlaying() && !hasError()"
      [class.hover:text-primary-600]="!isPlaying()"
      [class.hover:bg-primary-50]="!isPlaying()"
      [class.text-red-600]="isPlaying()"
      [class.bg-red-50]="isPlaying()"
      [class.text-orange-600]="hasError()"
      [class.audio-playing]="isPlaying()"
      [title]="getTitle()"
      [disabled]="!isSupported">
      @if (isLoading()) {
        <!-- Loading icon -->
        <svg class="animate-spin" [ngClass]="getIconSize()" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Chargement...</span>
      } @else if (isPlaying()) {
        <!-- Stop icon -->
        <svg [ngClass]="getIconSize()" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="1"/>
        </svg>
        <span>Arrêter</span>
      } @else if (hasError()) {
        <!-- Error icon -->
        <svg [ngClass]="getIconSize()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <span>Réessayer</span>
      } @else {
        <!-- Volume icon -->
        <svg [ngClass]="getIconSize()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
        </svg>
        <span>{{ isSupported ? 'Écouter' : 'Non supporté' }}</span>
      }
    </button>
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .audio-playing {
      animation: pulse 1.5s ease-in-out infinite;
    }
  `]
})
export class AudioButtonComponent implements OnInit, OnDestroy {
  @Input({ required: true }) text!: string;
  @Input() size: ButtonSize = 'default';

  isPlaying = signal(false);
  isLoading = signal(false);
  hasError = signal(false);

  isSupported = false;
  private utterance: SpeechSynthesisUtterance | null = null;
  private frenchVoice: SpeechSynthesisVoice | null = null;

  ngOnInit(): void {
    this.isSupported = 'speechSynthesis' in window;
    if (this.isSupported) {
      this.loadVoices();
      // Chrome charge les voix de façon asynchrone
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  ngOnDestroy(): void {
    this.stopSpeech();
  }

  private loadVoices(): void {
    const voices = window.speechSynthesis.getVoices();
    // Chercher une voix française
    this.frenchVoice = voices.find(v => v.lang.startsWith('fr')) || null;
  }

  getTitle(): string {
    if (!this.isSupported) return 'Synthèse vocale non supportée par ce navigateur';
    if (this.hasError()) return 'Erreur de lecture - Cliquer pour réessayer';
    if (this.isPlaying()) return 'Arrêter la lecture';
    return 'Écouter';
  }

  getSizeClasses(): string {
    const sizeClasses: Record<ButtonSize, string> = {
      small: 'px-2 py-1 text-xs',
      default: 'px-3 py-1.5 text-sm',
      large: 'px-4 py-2 text-base font-medium'
    };
    return sizeClasses[this.size];
  }

  getIconSize(): string {
    const iconSizes: Record<ButtonSize, string> = {
      small: 'w-3 h-3',
      default: 'w-4 h-4',
      large: 'w-5 h-5'
    };
    return iconSizes[this.size];
  }

  handleSpeak(): void {
    this.hasError.set(false);
    if (this.isPlaying()) {
      this.stopSpeech();
    } else {
      this.startSpeech();
    }
  }

  private stopSpeech(): void {
    window.speechSynthesis.cancel();
    this.isPlaying.set(false);
    this.isLoading.set(false);
    this.utterance = null;
  }

  private startSpeech(): void {
    if (!this.isSupported) return;

    // Arrêter toute lecture en cours
    window.speechSynthesis.cancel();
    this.isLoading.set(true);

    // Workaround Chrome: cancel() puis speak() peut bloquer
    // On utilise un petit délai
    setTimeout(() => {
      const cleanedText = this.cleanTextForSpeech(this.text);

      if (!cleanedText || cleanedText.length < 2) {
        this.hasError.set(true);
        this.isLoading.set(false);
        return;
      }

      this.utterance = new SpeechSynthesisUtterance(cleanedText);
      this.utterance.lang = 'fr-FR';
      this.utterance.rate = 0.9;
      this.utterance.pitch = 1;
      this.utterance.volume = 1;

      // Utiliser la voix française si disponible
      if (this.frenchVoice) {
        this.utterance.voice = this.frenchVoice;
      }

      // onstart est gardé comme backup mais l'état est déjà mis à jour après speak()
      this.utterance.onstart = () => {
        // S'assurer que l'état est correct (backup)
        if (this.isLoading()) {
          this.isLoading.set(false);
        }
        if (!this.isPlaying()) {
          this.isPlaying.set(true);
        }
      };

      this.utterance.onend = () => {
        this.isPlaying.set(false);
      };

      this.utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        this.isLoading.set(false);
        this.isPlaying.set(false);
        if (event.error !== 'canceled') {
          this.hasError.set(true);
        }
      };

      // Workaround: Chrome peut bloquer si on appelle speak() trop vite après cancel()
      window.speechSynthesis.speak(this.utterance);

      // IMPORTANT: Passer à isPlaying immédiatement après speak()
      // Ne pas attendre onstart car il peut être retardé ou ne pas se déclencher
      this.isLoading.set(false);
      this.isPlaying.set(true);

      // Chrome bug: la lecture peut se bloquer après ~15 secondes
      // Solution: pause/resume périodique
      this.setupChromeBugWorkaround();
    }, 100);
  }

  private setupChromeBugWorkaround(): void {
    // Chrome a un bug où la synthèse se bloque après ~15 secondes
    // Solution: pause/resume périodique
    const resumeInterval = setInterval(() => {
      if (!this.isPlaying()) {
        clearInterval(resumeInterval);
        return;
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 10000);

    // Nettoyer l'interval quand la lecture est terminée
    setTimeout(() => {
      if (!this.isPlaying()) {
        clearInterval(resumeInterval);
      }
    }, 1000);
  }

  private cleanTextForSpeech(text: string): string {
    if (!text) return '';

    return text
      // Supprimer les blocs de code
      .replace(/```[\s\S]*?```/g, '')
      // Supprimer le code inline
      .replace(/`[^`]*`/g, '')
      // Supprimer le markdown gras
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      // Supprimer le markdown italique
      .replace(/\*([^*]+)\*/g, '$1')
      // Supprimer les titres markdown
      .replace(/#{1,6}\s/g, '')
      // Convertir les liens markdown
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remplacer "Art." par "Article"
      .replace(/Art\.\s*/g, 'Article ')
      // Remplacer "al." par "alinéa"
      .replace(/al\.\s*/g, 'alinéa ')
      // Remplacer les paragraphes multiples par des pauses
      .replace(/\n{2,}/g, '. ')
      // Remplacer les retours à la ligne simples
      .replace(/\n/g, ' ')
      // Remplacer FCFA
      .replace(/FCFA/g, 'francs CFA')
      // Remplacer les pourcentages
      .replace(/%/g, ' pour cent')
      // Remplacer les numéros avec ° (1°, 2°, etc.)
      .replace(/(\d+)°/g, '$1 degré')
      // Nettoyer les espaces multiples
      .replace(/\s+/g, ' ')
      .trim();
  }
}
