import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectionStrategy,
  DestroyRef,
  SecurityContext,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, StreamEvent } from '@core/services/chat.service';
import { AuthService } from '@core/services/auth.service';
import { VoiceSearchService } from '@core/services/voice-search.service';
import { LoggerService } from '@core/services/logger.service';

interface Message {
  id: string;
  role: string;
  content: string;
  citations?: { articleNumber: string; title?: string; excerpt: string }[];
  cgiVersion?: string;
  isVoice?: boolean;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
})
export class ChatWidgetComponent implements AfterViewChecked {
  chatService = inject(ChatService);
  voiceService = inject(VoiceSearchService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private logger = inject(LoggerService);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = signal(false);
  messageInput = '';
  messages = signal<Message[]>([]);
  isListening = signal(false);
  liveTranscript = signal('');
  currentSpeakingId = '';
  private lastVoiceQuery = false;

  userInitials = computed(() => {
    const user = this.authService.user();
    if (!user) return 'U';
    const first = user.firstName?.charAt(0)?.toUpperCase() || '';
    const last = user.lastName?.charAt(0)?.toUpperCase() || '';
    return (first + last) || user.email.charAt(0).toUpperCase();
  });

  constructor() {
    // S'abonner aux changements d'état du service vocal
    this.voiceService.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(state => {
        this.isListening.set(state.isListening);
      });

    // S'abonner à la transcription en temps réel
    this.voiceService.transcript$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(transcript => {
        this.liveTranscript.set(transcript);
      });

    // S'abonner aux résultats finaux
    this.voiceService.result$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.isFinal && result.transcript.trim()) {
          this.onVoiceResult(result.transcript);
        }
      });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  toggleChat(): void {
    this.isOpen.update(v => !v);
  }

  // ============================================
  // VOCAL
  // ============================================

  toggleVoice(): void {
    if (this.isListening()) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening(): void {
    this.liveTranscript.set('');
    this.voiceService.startListening();
  }

  stopListening(): void {
    this.voiceService.stopListening();
  }

  private onVoiceResult(transcript: string): void {
    this.lastVoiceQuery = true;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'USER',
      content: transcript,
      isVoice: true,
    };
    this.messages.update(m => [...m, userMessage]);
    this.liveTranscript.set('');
    this.sendMessageWithStreaming(transcript);
  }

  async speakMessage(content: string): Promise<void> {
    if (this.voiceService.isSpeaking()) {
      this.voiceService.stopSpeaking();
      this.currentSpeakingId = '';
      return;
    }

    // Nettoyer le contenu pour la lecture
    const cleanText = content
      .replace(/<[^>]*>/g, '')
      .replace(/\*\*/g, '')
      .replace(/\n+/g, '. ');

    const messageId = this.messages().find(m => m.content === content)?.id || '';
    this.currentSpeakingId = messageId;

    try {
      await this.voiceService.speak(cleanText, { rate: 0.95 });
    } finally {
      this.currentSpeakingId = '';
    }
  }

  // ============================================
  // MESSAGES
  // ============================================

  onSubmit(): void {
    const content = this.messageInput.trim();
    if (!content || this.chatService.isStreaming()) return;

    this.lastVoiceQuery = false;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'USER',
      content,
    };
    this.messages.update(m => [...m, userMessage]);
    this.messageInput = '';

    this.sendMessageWithStreaming(content);
  }

  handleEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 96) + 'px';
  }

  onResetConversation(): void {
    this.messages.set([]);
    this.chatService.clearCurrentConversation();
    this.voiceService.stopSpeaking();
  }

  private sendMessageWithStreaming(content: string): void {
    const conversationId = this.chatService.currentConversation()?.id;
    const wasVoiceQuery = this.lastVoiceQuery;

    this.chatService
      .sendMessageStreaming({
        content,
        conversationId,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event: StreamEvent) => {
          switch (event.type) {
            case 'done': {
              const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: 'ASSISTANT',
                content: this.chatService.streamingContent(),
                citations: this.chatService.streamingCitations(),
                cgiVersion: this.chatService.streamingCgiVersion(),
              };
              this.messages.update(m => [...m, assistantMessage]);
              this.chatService.resetStreamingState();

              // Lecture automatique si la question était vocale
              if (wasVoiceQuery) {
                this.speakMessage(assistantMessage.content);
              }
              break;
            }
            case 'error':
              this.logger.error('Streaming error', 'ChatWidget', { error: event.error });
              this.chatService.resetStreamingState();
              break;
          }
        },
        error: () => {
          this.logger.error('Stream connection error', 'ChatWidget');
          this.chatService.resetStreamingState();
        },
      });
  }

  /**
   * Formate le contenu streaming pour l'affichage HTML
   * SECURITE: Echappe les caracteres HTML avant le formatage
   */
  formatStreamingContent(): SafeHtml {
    let content = this.chatService.streamingContent();

    // D'abord echapper les caracteres HTML pour prevenir XSS
    content = this.escapeHtml(content);

    // Puis appliquer le formatage markdown securise
    content = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    // Sanitizer le HTML final
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, content);
    return sanitized ?? '';
  }

  private escapeHtml(text: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
    };
    return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
  }
}
