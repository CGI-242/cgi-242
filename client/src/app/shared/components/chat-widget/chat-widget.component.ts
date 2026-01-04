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
  HostListener,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Citation, StreamEvent } from '@core/services/chat.service';
import { AuthService } from '@core/services/auth.service';

interface Message {
  id: string;
  role: string;
  content: string;
  citations?: { articleNumber: string; title?: string; excerpt: string }[];
  cgiVersion?: string;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating button -->
    <button
      (click)="toggleChat()"
      class="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50"
      [class.scale-0]="isOpen()"
      [class.opacity-0]="isOpen()">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    </button>

    <!-- Chat popup -->
    @if (isOpen()) {
      <div
        class="fixed bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-secondary-200 animate-slide-up">
        <!-- Header -->
        <div class="h-14 bg-primary-600 px-4 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span class="text-white text-xs font-bold">CGI</span>
            </div>
            <div>
              <h3 class="font-medium text-white text-sm">Assistant CGI</h3>
              <p class="text-xs text-white/70">Posez vos questions fiscales</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            @if (messages().length > 0) {
              <button
                (click)="onResetConversation()"
                class="w-8 h-8 hover:bg-white/10 rounded-full flex items-center justify-center transition"
                title="Nouvelle conversation">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            }
            <button
              (click)="toggleChat()"
              class="w-8 h-8 hover:bg-white/10 rounded-full flex items-center justify-center transition">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div #messagesContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50">
          @if (messages().length === 0 && !chatService.isStreaming()) {
            <div class="flex items-center justify-center h-full">
              <div class="text-center">
                <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
                <p class="text-sm text-secondary-600">Comment puis-je vous aider ?</p>
              </div>
            </div>
          } @else {
            @for (message of messages(); track message.id) {
              <div class="flex gap-2" [class.flex-row-reverse]="message.role === 'USER'">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  [class.bg-primary-100]="message.role === 'ASSISTANT'"
                  [class.bg-primary-600]="message.role === 'USER'">
                  @if (message.role === 'ASSISTANT') {
                    <span class="text-primary-600 text-[10px] font-bold">CGI</span>
                  } @else {
                    <span class="text-white text-[10px] font-bold">{{ userInitials() }}</span>
                  }
                </div>
                <div
                  class="max-w-[80%] rounded-xl px-3 py-2 text-sm"
                  [class.bg-primary-600]="message.role === 'USER'"
                  [class.text-white]="message.role === 'USER'"
                  [class.rounded-tr-none]="message.role === 'USER'"
                  [class.bg-white]="message.role === 'ASSISTANT'"
                  [class.border]="message.role === 'ASSISTANT'"
                  [class.border-secondary-200]="message.role === 'ASSISTANT'"
                  [class.rounded-tl-none]="message.role === 'ASSISTANT'">
                  <p class="whitespace-pre-wrap">{{ message.content }}</p>
                  @if (message.citations && message.citations.length > 0) {
                    <p class="text-[10px] mt-1 opacity-70">Source: CGI {{ message.cgiVersion || '2026' }}</p>
                  }
                </div>
              </div>
            }

            @if (chatService.isStreaming()) {
              <div class="flex gap-2">
                <div class="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-primary-600 text-[10px] font-bold">CGI</span>
                </div>
                <div class="bg-white border border-secondary-200 rounded-xl rounded-tl-none px-3 py-2 max-w-[80%]">
                  @if (chatService.streamingContent()) {
                    <p class="whitespace-pre-wrap text-sm" [innerHTML]="formatStreamingContent()"></p>
                    <span class="inline-block w-1.5 h-3 bg-primary-600 animate-pulse ml-0.5"></span>
                  } @else {
                    <div class="flex items-center gap-1.5">
                      <div class="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce"></div>
                      <div class="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                      <div class="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>

        <!-- Input -->
        <div class="border-t border-secondary-200 bg-white p-3 flex-shrink-0">
          <form (ngSubmit)="onSubmit()" class="flex items-end gap-2">
            <textarea
              [(ngModel)]="messageInput"
              name="message"
              rows="1"
              class="flex-1 resize-none min-h-[40px] max-h-24 px-3 py-2 border border-secondary-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Votre question..."
              (keydown.enter)="handleEnterKey($event)"
              (input)="autoResize($event)">
            </textarea>
            <button
              type="submit"
              [disabled]="!messageInput.trim() || chatService.isStreaming()"
              class="h-10 w-10 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white rounded-xl flex items-center justify-center transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes slide-up {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-slide-up {
      animation: slide-up 0.2s ease-out;
    }
  `],
})
export class ChatWidgetComponent implements AfterViewChecked {
  chatService = inject(ChatService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = signal(false);
  messageInput = '';
  messages = signal<Message[]>([]);

  userInitials = computed(() => {
    const user = this.authService.user();
    if (!user) return 'U';
    const first = user.firstName?.charAt(0)?.toUpperCase() || '';
    const last = user.lastName?.charAt(0)?.toUpperCase() || '';
    return (first + last) || user.email.charAt(0).toUpperCase();
  });

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

  onSubmit(): void {
    const content = this.messageInput.trim();
    if (!content || this.chatService.isStreaming()) return;

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
  }

  private sendMessageWithStreaming(content: string): void {
    let conversationId = this.chatService.currentConversation()?.id;

    this.chatService
      .sendMessageStreaming({
        content,
        conversationId,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event: StreamEvent) => {
          switch (event.type) {
            case 'done':
              const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: 'ASSISTANT',
                content: this.chatService.streamingContent(),
                citations: this.chatService.streamingCitations(),
                cgiVersion: this.chatService.streamingCgiVersion(),
              };
              this.messages.update(m => [...m, assistantMessage]);
              this.chatService.resetStreamingState();
              break;
            case 'error':
              console.error('Streaming error:', event.error);
              this.chatService.resetStreamingState();
              break;
          }
        },
        error: (error) => {
          console.error('Stream error:', error);
          this.chatService.resetStreamingState();
        },
      });
  }

  formatStreamingContent(): string {
    let content = this.chatService.streamingContent();
    content = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    return content;
  }
}
