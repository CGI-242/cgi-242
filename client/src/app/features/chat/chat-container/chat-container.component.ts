import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, AfterViewChecked, ChangeDetectionStrategy, DestroyRef, OnDestroy, SecurityContext } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatService, Conversation, StreamEvent } from '@core/services/chat.service';
import { TenantService } from '@core/services/tenant.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { LoggerService } from '@core/services/logger.service';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { ChatHistoryComponent } from '../chat-history/chat-history.component';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ChatInputComponent,
    ChatMessageComponent,
    ChatHistoryComponent,
    HeaderComponent,
    SidebarComponent,
  ],
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss'],
})
export class ChatContainerComponent implements OnInit, AfterViewChecked, OnDestroy {
  chatService = inject(ChatService);
  tenantService = inject(TenantService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);
  private toast = inject(ToastService);
  private logger = inject(LoggerService);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  sidebarCollapsed = false;
  currentConversation = this.chatService.currentConversation;
  messages = signal<{ id: string; role: string; content: string; citations?: { articleNumber: string; title?: string; excerpt: string }[]; cgiVersion?: string }[]>([]);

  // Use streaming by default
  useStreaming = true;

  userInitials = computed(() => {
    const user = this.authService.user();
    if (!user) return 'U';
    const first = user.firstName?.charAt(0)?.toUpperCase() || '';
    const last = user.lastName?.charAt(0)?.toUpperCase() || '';
    return (first + last) || user.email.charAt(0).toUpperCase();
  });

  userName = computed(() => {
    const user = this.authService.user();
    if (!user) return '';
    return user.firstName || user.email.split('@')[0];
  });

  ngOnInit(): void {
    this.chatService.loadConversations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
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

  onSelectConversation(conversation: Conversation): void {
    this.chatService.loadConversation(conversation.id).subscribe((conv) => {
      if (conv?.messages) {
        this.messages.set(conv.messages);
      }
    });
  }

  onNewConversation(): void {
    this.chatService.clearCurrentConversation();
    this.messages.set([]);
  }

  onResetConversation(): void {
    const convId = this.currentConversation()?.id;
    if (convId) {
      this.chatService.deleteConversation(convId).subscribe({
        next: () => {
          this.chatService.clearCurrentConversation();
          this.messages.set([]);
          this.chatService.loadConversations().subscribe();
          this.toast.success('Conversation réinitialisée');
        },
        error: () => {
          this.toast.error('Erreur lors de la réinitialisation');
        }
      });
    } else {
      this.messages.set([]);
    }
  }

  onSendMessage(content: string): void {
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'USER',
      content,
    };
    this.messages.update((m) => [...m, userMessage]);

    if (this.useStreaming) {
      this.sendMessageWithStreaming(content);
    } else {
      this.sendMessageWithoutStreaming(content);
    }
  }

  private sendMessageWithStreaming(content: string): void {
    let conversationId = this.currentConversation()?.id;

    this.chatService
      .sendMessageStreaming({
        content,
        conversationId,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event: StreamEvent) => {
          switch (event.type) {
            case 'conversation':
              if (event.conversationId) {
                conversationId = event.conversationId;
              }
              break;
            case 'chunk':
              break;
            case 'citations':
              break;
            case 'done': {
              // Add the complete message to the list
              const assistantMessage = {
                id: crypto.randomUUID(),
                role: 'ASSISTANT',
                content: this.chatService.streamingContent(),
                citations: this.chatService.streamingCitations(),
                cgiVersion: this.chatService.streamingCgiVersion(),
              };
              this.messages.update((m) => [...m, assistantMessage]);
              this.chatService.resetStreamingState();

              // Reload conversations to update the list
              this.chatService.loadConversations()
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe();
              break;
            }
            case 'error':
              this.logger.error('Streaming error', 'ChatContainer', { error: event.error });
              this.chatService.resetStreamingState();
              this.toast.error({
                title: 'Erreur',
                message: 'Une erreur est survenue lors de la réponse'
              });
              break;
          }
        },
        error: () => {
          this.logger.error('Stream connection error', 'ChatContainer');
          this.chatService.resetStreamingState();
          this.toast.error({
            title: 'Erreur de connexion',
            message: 'Impossible de contacter le serveur'
          });
        },
      });
  }

  private sendMessageWithoutStreaming(content: string): void {
    this.chatService
      .sendMessage({
        content,
        conversationId: this.currentConversation()?.id,
      })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.messages.update((m) => [...m, res.data!.message]);
          } else {
            this.toast.error(res.error ?? 'Erreur lors de l\'envoi du message');
          }
        },
        error: () => {
          this.toast.error({
            title: 'Erreur de connexion',
            message: 'Impossible de contacter le serveur'
          });
        }
      });
  }

  /**
   * Format streaming content for display
   * Converts markdown-like formatting to HTML with XSS protection
   * Uses Angular's DomSanitizer to prevent script injection
   */
  formatStreamingContent(): SafeHtml {
    let content = this.chatService.streamingContent();

    // First, escape HTML special characters to prevent XSS
    content = this.escapeHtml(content);

    // Then apply safe markdown-like formatting
    content = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    // Sanitize the final HTML to ensure no malicious content
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, content);
    return sanitized ?? '';
  }

  /**
   * Escape HTML special characters to prevent XSS attacks
   */
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

  ngOnDestroy(): void {
    // Cancel any ongoing stream when component is destroyed
    this.chatService.cancelStream();
  }
}
