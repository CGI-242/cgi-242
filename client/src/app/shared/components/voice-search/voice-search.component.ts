import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { VoiceSearchService, VoiceState, VoiceError } from '@core/services/voice-search.service';

@Component({
  selector: 'app-voice-search',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="voice-search-container">
      <!-- Bouton principal -->
      <button
        class="voice-button"
        [class.listening]="state.isListening"
        [class.speaking]="state.isSpeaking"
        [class.processing]="state.isProcessing"
        [class.disabled]="!state.isSupported"
        [class.mini]="mini"
        [disabled]="!state.isSupported || state.isProcessing"
        (click)="onVoiceButtonClick()"
        [attr.aria-label]="getAriaLabel()">
        <!-- Icône microphone -->
        @if (!state.isListening && !state.isSpeaking) {
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path
              d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        }

        <!-- Animation d'écoute -->
        @if (state.isListening) {
          <div class="listening-animation">
            <span class="wave"></span>
            <span class="wave"></span>
            <span class="wave"></span>
          </div>
        }

        <!-- Icône haut-parleur (lecture) -->
        @if (state.isSpeaking) {
          <svg class="icon speaking-icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        }

        <!-- Spinner de traitement -->
        @if (state.isProcessing) {
          <div class="spinner"></div>
        }
      </button>

      <!-- Indicateur de statut -->
      @if (showStatus) {
        <div class="status-indicator">
          @if (state.isListening) {
            <span class="status listening"> Je vous écoute... </span>
          }
          @if (state.isSpeaking) {
            <span class="status speaking"> Lecture en cours... </span>
          }
          @if (state.isProcessing) {
            <span class="status processing"> Recherche en cours... </span>
          }
        </div>
      }

      <!-- Transcription en temps réel -->
      @if (showTranscript && transcript) {
        <div class="transcript-container">
          <p class="transcript">{{ transcript }}</p>
        </div>
      }

      <!-- Message d'erreur -->
      @if (errorMessage) {
        <div class="error-container">
          <p class="error">{{ errorMessage }}</p>
          <button class="dismiss-btn" (click)="dismissError()">x</button>
        </div>
      }

      <!-- Bouton stop lecture -->
      @if (state.isSpeaking && showStopButton) {
        <button class="stop-button" (click)="stopSpeaking()" aria-label="Arrêter la lecture">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>
      }
    </div>
  `,
  styles: [
    `
      .voice-search-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .voice-button {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
        position: relative;
        overflow: hidden;
      }

      .voice-button.mini {
        width: 40px;
        height: 40px;
      }

      .voice-button:hover:not(.disabled) {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
      }

      .voice-button:active:not(.disabled) {
        transform: scale(0.95);
      }

      .voice-button.listening {
        background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
        animation: pulse 1.5s infinite;
      }

      .voice-button.speaking {
        background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
      }

      .voice-button.processing {
        background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
      }

      .voice-button.disabled {
        background: #9ca3af;
        cursor: not-allowed;
        box-shadow: none;
      }

      .icon {
        width: 24px;
        height: 24px;
      }

      .mini .icon {
        width: 20px;
        height: 20px;
      }

      .speaking-icon {
        animation: speakingPulse 0.8s ease-in-out infinite;
      }

      /* Animation d'écoute - barres */
      .listening-animation {
        display: flex;
        align-items: center;
        gap: 3px;
        height: 20px;
      }

      .wave {
        width: 3px;
        height: 100%;
        background: white;
        border-radius: 2px;
        animation: wave 1s ease-in-out infinite;
      }

      .wave:nth-child(2) {
        animation-delay: 0.2s;
      }

      .wave:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes wave {
        0%,
        100% {
          height: 6px;
        }
        50% {
          height: 20px;
        }
      }

      @keyframes pulse {
        0%,
        100% {
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
        }
        50% {
          box-shadow: 0 4px 30px rgba(239, 68, 68, 0.6);
        }
      }

      @keyframes speakingPulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
        }
      }

      /* Spinner */
      .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Status indicator */
      .status-indicator {
        min-height: 20px;
      }

      .status {
        font-size: 12px;
        color: #6b7280;
        animation: fadeIn 0.3s ease;
      }

      .status.listening {
        color: #ef4444;
      }

      .status.speaking {
        color: #10b981;
      }

      .status.processing {
        color: #f59e0b;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Transcription */
      .transcript-container {
        max-width: 280px;
        text-align: center;
      }

      .transcript {
        font-size: 14px;
        color: #374151;
        font-style: italic;
        margin: 0;
        padding: 8px 12px;
        background: #f3f4f6;
        border-radius: 8px;
        animation: fadeIn 0.3s ease;
      }

      /* Erreur */
      .error-container {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: #fee2e2;
        border-radius: 6px;
        animation: shake 0.5s ease;
      }

      .error {
        font-size: 12px;
        color: #dc2626;
        margin: 0;
      }

      .dismiss-btn {
        background: none;
        border: none;
        color: #dc2626;
        cursor: pointer;
        padding: 2px;
        font-size: 12px;
      }

      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        25% {
          transform: translateX(-5px);
        }
        75% {
          transform: translateX(5px);
        }
      }

      /* Bouton stop */
      .stop-button {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: #ef4444;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .stop-button:hover {
        background: #dc2626;
        transform: scale(1.1);
      }

      .stop-button svg {
        width: 14px;
        height: 14px;
      }
    `,
  ],
})
export class VoiceSearchComponent implements OnInit, OnDestroy {
  // Inputs
  @Input() showStatus = true;
  @Input() showTranscript = true;
  @Input() showStopButton = true;
  @Input() autoReadResponse = true;
  @Input() mini = false;

  // Outputs
  @Output() querySubmitted = new EventEmitter<string>();
  @Output() listeningChanged = new EventEmitter<boolean>();
  @Output() speakingChanged = new EventEmitter<boolean>();
  @Output() errorOccurred = new EventEmitter<VoiceError>();

  // État
  state: VoiceState = {
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    isSupported: true,
  };

  transcript = '';
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(private voiceService: VoiceSearchService) {}

  ngOnInit(): void {
    // S'abonner aux changements d'état
    this.voiceService.state$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.state = state;
      this.listeningChanged.emit(state.isListening);
      this.speakingChanged.emit(state.isSpeaking);
    });

    // S'abonner à la transcription
    this.voiceService.transcript$.pipe(takeUntil(this.destroy$)).subscribe((transcript) => {
      this.transcript = transcript;
    });

    // S'abonner aux résultats finaux
    this.voiceService.result$.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result.isFinal && result.transcript.trim()) {
        this.onFinalResult(result.transcript);
      }
    });

    // S'abonner aux erreurs
    this.voiceService.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      this.errorMessage = error.message;
      this.errorOccurred.emit(error);

      // Auto-dismiss après 5 secondes
      setTimeout(() => this.dismissError(), 5000);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.voiceService.stopListening();
    this.voiceService.stopSpeaking();
  }

  // ============================================
  // ACTIONS
  // ============================================

  onVoiceButtonClick(): void {
    if (this.state.isSpeaking) {
      this.stopSpeaking();
    } else if (this.state.isListening) {
      this.voiceService.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening(): void {
    this.errorMessage = '';
    this.transcript = '';
    this.voiceService.startListening();
  }

  stopSpeaking(): void {
    this.voiceService.stopSpeaking();
  }

  dismissError(): void {
    this.errorMessage = '';
  }

  private onFinalResult(transcript: string): void {
    this.querySubmitted.emit(transcript);
  }

  /**
   * Méthode publique pour lire une réponse
   */
  async speakResponse(text: string): Promise<void> {
    if (this.autoReadResponse) {
      await this.voiceService.speak(text);
    }
  }

  getAriaLabel(): string {
    if (!this.state.isSupported) {
      return 'Reconnaissance vocale non supportée';
    }
    if (this.state.isSpeaking) {
      return 'Arrêter la lecture';
    }
    if (this.state.isListening) {
      return "Arrêter l'écoute";
    }
    return 'Activer la recherche vocale';
  }
}
