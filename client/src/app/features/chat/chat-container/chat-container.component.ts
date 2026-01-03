import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, AfterViewChecked, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ChatService, Conversation } from '@core/services/chat.service';
import { TenantService } from '@core/services/tenant.service';
import { AuthService } from '@core/services/auth.service';
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
  template: `
    <div class="min-h-screen bg-secondary-50">
      <app-header />

      <div class="flex">
        <app-sidebar [collapsed]="sidebarCollapsed" />

        <main
          class="flex-1 transition-all duration-300"
          [class.ml-56]="!sidebarCollapsed"
          [class.ml-14]="sidebarCollapsed">
          <div class="flex h-[calc(100vh-4rem)]">
            <!-- History sidebar -->
            <div class="w-80 border-r border-secondary-200 bg-white hidden lg:block">
              <app-chat-history
                [conversations]="chatService.conversations()"
                [currentConversationId]="chatService.currentConversation()?.id"
                (selectConversation)="onSelectConversation($event)"
                (newConversation)="onNewConversation()" />
            </div>

            <!-- Chat area -->
            <div class="flex-1 flex flex-col">
              <!-- Header -->
              <div class="h-14 border-b border-secondary-200 bg-white px-6 flex items-center justify-between">
                <div>
                  @if (currentConversation(); as conv) {
                    <h2 class="font-medium text-secondary-900">
                      {{ conv.title ?? 'Nouvelle conversation' }}
                    </h2>
                    @if (tenantService.isOrganization()) {
                      <p class="text-xs text-secondary-500">
                        {{ conv.visibility === 'TEAM' ? "Visible par l'équipe" : 'Privée' }}
                      </p>
                    }
                  } @else {
                    <h2 class="font-medium text-secondary-900">Nouvelle conversation</h2>
                    <p class="text-xs text-secondary-500">Posez votre question sur le CGI</p>
                  }
                </div>
                <!-- Bouton réinitialiser -->
                @if (messages().length > 0) {
                  <button
                    (click)="onResetConversation()"
                    class="flex items-center gap-2 px-3 py-1.5 text-sm text-secondary-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Réinitialiser la conversation">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    <span>Réinitialiser</span>
                  </button>
                }
              </div>

              <!-- Messages -->
              <div #messagesContainer class="flex-1 overflow-y-auto p-6 space-y-8">
                @if (!currentConversation() && messages().length === 0) {
                  <div class="flex items-center justify-center h-full">
                    <div class="text-center max-w-md">
                      <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                      </div>
                      <h3 class="text-lg font-semibold text-secondary-900 mb-2">
                        Assistant Fiscal CGI Congo
                      </h3>
                      <p class="text-secondary-600 text-sm">
                        Comment puis-je vous aider ?
                      </p>
                    </div>
                  </div>
                } @else {
                  @for (message of messages(); track message.id) {
                    <app-chat-message [message]="message" [userInitials]="userInitials()" />
                  }

                  @if (chatService.isLoading()) {
                    <div class="flex gap-3">
                      <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="text-primary-600 text-xs font-bold">CGI</span>
                      </div>
                      <div class="bg-white border border-secondary-200 rounded-2xl rounded-tl-none p-4">
                        <div class="flex items-center gap-2">
                          <div class="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                          <div class="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                          <div class="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                        </div>
                      </div>
                    </div>
                  }
                }
              </div>

              <!-- Input -->
              <app-chat-input (sendMessage)="onSendMessage($event)" />
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class ChatContainerComponent implements OnInit, AfterViewChecked {
  chatService = inject(ChatService);
  tenantService = inject(TenantService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  sidebarCollapsed = false;
  currentConversation = this.chatService.currentConversation;
  messages = signal<{ id: string; role: string; content: string; citations?: { articleNumber: string; title?: string; excerpt: string }[] }[]>([]);

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
      this.chatService.deleteConversation(convId).subscribe(() => {
        this.chatService.clearCurrentConversation();
        this.messages.set([]);
        this.chatService.loadConversations().subscribe();
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

    this.chatService
      .sendMessage({
        content,
        conversationId: this.currentConversation()?.id,
      })
      .subscribe((res) => {
        if (res.success && res.data) {
          this.messages.update((m) => [...m, res.data!.message]);
        }
      });
  }

}
