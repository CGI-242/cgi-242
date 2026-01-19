import { Component, OnInit, OnDestroy, output, input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { VoiceSearchService, VoiceState, VoiceError } from '@core/services/voice-search.service';

@Component({
  selector: 'app-voice-search',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './voice-search.component.html',
  styleUrls: ['./voice-search.component.scss'],
})
export class VoiceSearchComponent implements OnInit, OnDestroy {
  // Inputs
  showStatus = input(true);
  showTranscript = input(true);
  showStopButton = input(true);
  autoReadResponse = input(true);
  mini = input(false);

  // Outputs
  querySubmitted = output<string>();
  listeningChanged = output<boolean>();
  speakingChanged = output<boolean>();
  errorOccurred = output<VoiceError>();

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
  private voiceService = inject(VoiceSearchService);

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
    if (this.autoReadResponse()) {
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
