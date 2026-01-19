// ============================================
// VOICE SEARCH SERVICE - TYPE DEFINITIONS
// ============================================

/**
 * Represents the current state of voice functionality
 */
export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isSupported: boolean;
}

/**
 * Represents a voice recognition result
 */
export interface VoiceResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

/**
 * Represents a voice-related error
 */
export interface VoiceError {
  code: string;
  message: string;
}

// ============================================
// WEB SPEECH API TYPES
// (Non inclus dans TypeScript par défaut)
// ============================================

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionEventResult {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorResult {
  readonly error: string;
  readonly message: string;
}

export interface IWebSpeechRecognition {
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
// CONSTANTS
// ============================================

/**
 * Error messages for speech recognition errors (French localized)
 */
export const SPEECH_RECOGNITION_ERROR_MESSAGES: Record<string, string> = {
  'no-speech': 'Aucune voix detectee. Veuillez reessayer.',
  'audio-capture': 'Microphone non disponible. Verifiez vos permissions.',
  'not-allowed': "Acces au microphone refuse. Autorisez l'acces dans les parametres.",
  network: 'Erreur reseau. Verifiez votre connexion.',
  aborted: 'Reconnaissance annulee.',
  'language-not-supported': 'Langue non supportee.',
};

/**
 * Default voice state
 */
export const DEFAULT_VOICE_STATE: VoiceState = {
  isListening: false,
  isSpeaking: false,
  isProcessing: false,
  isSupported: true,
};

/**
 * Speech synthesis options
 */
export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}
