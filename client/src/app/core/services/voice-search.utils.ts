// ============================================
// VOICE SEARCH SERVICE - UTILITY FUNCTIONS
// ============================================

/**
 * Gets the SpeechRecognition API from the window object
 * Handles both standard and webkit-prefixed versions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSpeechRecognitionAPI(): any | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const windowWithSpeech = window as any;
  return windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition || null;
}

/**
 * Checks if speech recognition is supported in the current browser
 */
export function checkRecognitionSupport(): boolean {
  return getSpeechRecognitionAPI() !== null;
}

/**
 * Checks if speech synthesis is supported in the current browser
 */
export function checkSynthesisSupport(): boolean {
  return 'speechSynthesis' in window;
}

/**
 * Finds a French voice from the available voices list
 * Prefers local service voices over network voices
 */
export function findFrenchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voices.find((v) => v.lang.startsWith('fr') && v.localService) || voices.find((v) => v.lang.startsWith('fr'))
  );
}

/**
 * Finds a voice by name from the available voices list
 */
export function findVoiceByName(voices: SpeechSynthesisVoice[], voiceName: string): SpeechSynthesisVoice | undefined {
  return voices.find((v) => v.name === voiceName);
}

/**
 * Requests microphone permission from the user
 * Returns true if permission granted, false otherwise
 */
export async function requestMicPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}
