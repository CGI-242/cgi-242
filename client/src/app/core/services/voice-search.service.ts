import { inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { LoggerService } from './logger.service';
import {
  VoiceState,
  VoiceResult,
  VoiceError,
  IWebSpeechRecognition,
  SpeechRecognitionEventResult,
  SpeechRecognitionErrorResult,
  SpeakOptions,
  SPEECH_RECOGNITION_ERROR_MESSAGES,
  DEFAULT_VOICE_STATE,
} from './voice-search.types';
import {
  getSpeechRecognitionAPI,
  checkRecognitionSupport,
  checkSynthesisSupport,
  findFrenchVoice,
  findVoiceByName,
  requestMicPermission,
} from './voice-search.utils';

// Re-export types for consumers
export { VoiceState, VoiceResult, VoiceError, SpeakOptions } from './voice-search.types';

@Injectable({
  providedIn: 'root',
})
export class VoiceSearchService {
  // Observable states
  private stateSubject = new BehaviorSubject<VoiceState>(DEFAULT_VOICE_STATE);
  private transcriptSubject = new BehaviorSubject<string>('');
  private resultSubject = new Subject<VoiceResult>();
  private errorSubject = new Subject<VoiceError>();

  // Public observables
  public state$: Observable<VoiceState> = this.stateSubject.asObservable();
  public transcript$: Observable<string> = this.transcriptSubject.asObservable();
  public result$: Observable<VoiceResult> = this.resultSubject.asObservable();
  public error$: Observable<VoiceError> = this.errorSubject.asObservable();

  // Web Speech API instances
  private recognition: IWebSpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;

  // Configuration
  private language = 'fr-FR';
  private voiceName = '';
  private ngZone = inject(NgZone);
  private logger = inject(LoggerService);

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  private initializeSpeechRecognition(): void {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();

    if (!SpeechRecognitionAPI) {
      this.updateState({ isSupported: false });
      this.logger.warn('Web Speech API non supportee', 'VoiceSearchService');
      return;
    }

    this.recognition = new SpeechRecognitionAPI() as IWebSpeechRecognition;
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.language;
    this.recognition.maxAlternatives = 1;

    this.setupRecognitionEventHandlers();
  }

  private setupRecognitionEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.ngZone.run(() => {
        this.updateState({ isListening: true });
        this.transcriptSubject.next('');
      });
    };

    this.recognition.onend = () => {
      this.ngZone.run(() => {
        this.updateState({ isListening: false });
      });
    };

    this.recognition.onresult = (event: SpeechRecognitionEventResult) => {
      this.ngZone.run(() => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        this.transcriptSubject.next(transcript);
        this.resultSubject.next({ transcript, isFinal: result.isFinal, confidence });
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorResult) => {
      this.ngZone.run(() => {
        this.updateState({ isListening: false });
        this.errorSubject.next({
          code: event.error,
          message: SPEECH_RECOGNITION_ERROR_MESSAGES[event.error] || `Erreur: ${event.error}`,
        });
      });
    };
  }

  private initializeSpeechSynthesis(): void {
    if (checkSynthesisSupport()) {
      this.synthesis = window.speechSynthesis;

      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
      this.loadVoices();
    }
  }

  private loadVoices(): void {
    if (!this.synthesis) return;

    const voices = this.synthesis.getVoices();
    const frenchVoice = findFrenchVoice(voices);

    if (frenchVoice) {
      this.voiceName = frenchVoice.name;
    }
  }

  private updateState(partialState: Partial<VoiceState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  // ============================================
  // PUBLIC METHODS - RECOGNITION
  // ============================================

  /** Starts voice listening */
  startListening(): void {
    if (!this.recognition) {
      this.errorSubject.next({
        code: 'not-supported',
        message: "La reconnaissance vocale n'est pas supportee par votre navigateur.",
      });
      return;
    }

    this.stopSpeaking();

    try {
      this.recognition.start();
    } catch {
      this.logger.debug('Recognition already started', 'VoiceSearchService');
    }
  }

  /** Stops voice listening */
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /** Toggles listening state */
  toggleListening(): void {
    if (this.stateSubject.value.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  // ============================================
  // PUBLIC METHODS - SPEECH SYNTHESIS
  // ============================================

  /** Speaks text aloud */
  speak(text: string, options?: SpeakOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Synthese vocale non supportee'));
        return;
      }

      this.stopSpeaking();

      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.lang = this.language;
      this.utterance.rate = options?.rate ?? 1.0;
      this.utterance.pitch = options?.pitch ?? 1.0;
      this.utterance.volume = options?.volume ?? 1.0;

      this.applyVoiceToUtterance();
      this.setupUtteranceEventHandlers(resolve, reject);

      this.synthesis.speak(this.utterance);
    });
  }

  private applyVoiceToUtterance(): void {
    if (!this.synthesis || !this.utterance) return;

    const voices = this.synthesis.getVoices();
    const selectedVoice = findVoiceByName(voices, this.voiceName);
    if (selectedVoice) {
      this.utterance.voice = selectedVoice;
    }
  }

  private setupUtteranceEventHandlers(resolve: () => void, reject: (error: Error) => void): void {
    if (!this.utterance) return;

    this.utterance.onstart = () => {
      this.ngZone.run(() => this.updateState({ isSpeaking: true }));
    };

    this.utterance.onend = () => {
      this.ngZone.run(() => {
        this.updateState({ isSpeaking: false });
        resolve();
      });
    };

    this.utterance.onerror = (event) => {
      this.ngZone.run(() => {
        this.updateState({ isSpeaking: false });
        reject(new Error(event.error));
      });
    };
  }

  /** Stops speech synthesis */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.updateState({ isSpeaking: false });
    }
  }

  /** Pauses speech synthesis */
  pauseSpeaking(): void {
    this.synthesis?.pause();
  }

  /** Resumes speech synthesis */
  resumeSpeaking(): void {
    this.synthesis?.resume();
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /** Sets the language for recognition and synthesis */
  setLanguage(lang: string): void {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  /** Checks if speech recognition is supported */
  isRecognitionSupported(): boolean {
    return checkRecognitionSupport();
  }

  /** Checks if speech synthesis is supported */
  isSynthesisSupported(): boolean {
    return checkSynthesisSupport();
  }

  /** Requests microphone permission */
  async requestMicrophonePermission(): Promise<boolean> {
    return requestMicPermission();
  }

  /** Gets available voices for synthesis */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis?.getVoices() || [];
  }

  /** Sets the voice to use for synthesis */
  setVoice(voiceName: string): void {
    this.voiceName = voiceName;
  }

  /** Gets the current state */
  getState(): VoiceState {
    return this.stateSubject.value;
  }

  /** Returns whether listening is active */
  isListening(): boolean {
    return this.stateSubject.value.isListening;
  }

  /** Returns whether speaking is active */
  isSpeaking(): boolean {
    return this.stateSubject.value.isSpeaking;
  }
}
