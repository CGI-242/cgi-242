import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// ============================================
// INTERFACES
// ============================================

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isSupported: boolean;
}

export interface VoiceResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export interface VoiceError {
  code: string;
  message: string;
}

// Types pour Web Speech API (non inclus dans TypeScript par défaut)
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEventResult {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorResult {
  readonly error: string;
  readonly message: string;
}

interface IWebSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventResult) => void) | null;
  onerror: ((event: SpeechRecognitionErrorResult) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// ============================================
// SERVICE
// ============================================

@Injectable({
  providedIn: 'root',
})
export class VoiceSearchService {
  // États observables
  private stateSubject = new BehaviorSubject<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    isSupported: true,
  });

  private transcriptSubject = new BehaviorSubject<string>('');
  private resultSubject = new Subject<VoiceResult>();
  private errorSubject = new Subject<VoiceError>();

  // Observables publics
  public state$: Observable<VoiceState> = this.stateSubject.asObservable();
  public transcript$: Observable<string> = this.transcriptSubject.asObservable();
  public result$: Observable<VoiceResult> = this.resultSubject.asObservable();
  public error$: Observable<VoiceError> = this.errorSubject.asObservable();

  // Instances Web Speech API
  private recognition: IWebSpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;

  // Configuration
  private language = 'fr-FR';
  private voiceName = '';

  constructor(private ngZone: NgZone) {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
  }

  // ============================================
  // INITIALISATION
  // ============================================

  private initializeSpeechRecognition(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowWithSpeech = window as any;
    const SpeechRecognitionAPI = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      this.updateState({ isSupported: false });
      console.warn('Web Speech API non supportée');
      return;
    }

    this.recognition = new SpeechRecognitionAPI() as IWebSpeechRecognition;
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.language;
    this.recognition.maxAlternatives = 1;

    // Événements
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

        this.resultSubject.next({
          transcript,
          isFinal: result.isFinal,
          confidence,
        });
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorResult) => {
      this.ngZone.run(() => {
        this.updateState({ isListening: false });

        const errorMessages: Record<string, string> = {
          'no-speech': 'Aucune voix détectée. Veuillez réessayer.',
          'audio-capture': 'Microphone non disponible. Vérifiez vos permissions.',
          'not-allowed': "Accès au microphone refusé. Autorisez l'accès dans les paramètres.",
          network: 'Erreur réseau. Vérifiez votre connexion.',
          aborted: 'Reconnaissance annulée.',
          'language-not-supported': 'Langue non supportée.',
        };

        this.errorSubject.next({
          code: event.error,
          message: errorMessages[event.error] || `Erreur: ${event.error}`,
        });
      });
    };
  }

  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;

      // Charger les voix (peut être asynchrone)
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
      this.loadVoices();
    }
  }

  private loadVoices(): void {
    if (!this.synthesis) return;

    const voices = this.synthesis.getVoices();
    // Chercher une voix française
    const frenchVoice =
      voices.find((v) => v.lang.startsWith('fr') && v.localService) || voices.find((v) => v.lang.startsWith('fr'));

    if (frenchVoice) {
      this.voiceName = frenchVoice.name;
    }
  }

  private updateState(partialState: Partial<VoiceState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  // ============================================
  // MÉTHODES PUBLIQUES - RECONNAISSANCE
  // ============================================

  /**
   * Démarre l'écoute vocale
   */
  startListening(): void {
    if (!this.recognition) {
      this.errorSubject.next({
        code: 'not-supported',
        message: "La reconnaissance vocale n'est pas supportée par votre navigateur.",
      });
      return;
    }

    // Arrêter la synthèse si en cours
    this.stopSpeaking();

    try {
      this.recognition.start();
    } catch {
      // Déjà en cours d'écoute
      console.warn('Recognition already started');
    }
  }

  /**
   * Arrête l'écoute vocale
   */
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Bascule l'état d'écoute
   */
  toggleListening(): void {
    if (this.stateSubject.value.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  // ============================================
  // MÉTHODES PUBLIQUES - SYNTHÈSE VOCALE
  // ============================================

  /**
   * Lit un texte à voix haute
   */
  speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Synthèse vocale non supportée'));
        return;
      }

      // Arrêter toute lecture en cours
      this.stopSpeaking();

      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.lang = this.language;
      this.utterance.rate = options?.rate ?? 1.0;
      this.utterance.pitch = options?.pitch ?? 1.0;
      this.utterance.volume = options?.volume ?? 1.0;

      // Appliquer la voix française si disponible
      const voices = this.synthesis.getVoices();
      const selectedVoice = voices.find((v) => v.name === this.voiceName);
      if (selectedVoice) {
        this.utterance.voice = selectedVoice;
      }

      this.utterance.onstart = () => {
        this.ngZone.run(() => {
          this.updateState({ isSpeaking: true });
        });
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

      this.synthesis.speak(this.utterance);
    });
  }

  /**
   * Arrête la lecture vocale
   */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.updateState({ isSpeaking: false });
    }
  }

  /**
   * Met en pause la lecture
   */
  pauseSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  /**
   * Reprend la lecture
   */
  resumeSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  /**
   * Définit la langue
   */
  setLanguage(lang: string): void {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  /**
   * Vérifie si la reconnaissance vocale est supportée
   */
  isRecognitionSupported(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowWithSpeech = window as any;
    return !!(windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition);
  }

  /**
   * Vérifie si la synthèse vocale est supportée
   */
  isSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * Demande la permission du microphone
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtient la liste des voix disponibles
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis?.getVoices() || [];
  }

  /**
   * Définit la voix à utiliser
   */
  setVoice(voiceName: string): void {
    this.voiceName = voiceName;
  }

  /**
   * Retourne l'état actuel
   */
  getState(): VoiceState {
    return this.stateSubject.value;
  }

  /**
   * Retourne si l'écoute est en cours
   */
  isListening(): boolean {
    return this.stateSubject.value.isListening;
  }

  /**
   * Retourne si la lecture est en cours
   */
  isSpeaking(): boolean {
    return this.stateSubject.value.isSpeaking;
  }
}
