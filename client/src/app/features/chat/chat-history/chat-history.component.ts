import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '@core/services/chat.service';

@Component({
  selector: 'app-chat-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-secondary-200">
        <button
          (click)="newConversation.emit()"
          class="btn-primary w-full flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle conversation
        </button>
      </div>

      <!-- Conversations list -->
      <div class="flex-1 overflow-y-auto p-2">
        @if (conversations().length === 0) {
          <div class="text-center py-8">
            <p class="text-sm text-secondary-500">Aucune conversation</p>
          </div>
        } @else {
          <div class="space-y-1">
            @for (conversation of conversations(); track conversation.id) {
              <button
                (click)="selectConversation.emit(conversation)"
                class="w-full text-left p-3 rounded-lg transition hover:bg-secondary-100"
                [class.bg-primary-50]="conversation.id === currentConversationId()"
                [class.border-l-2]="conversation.id === currentConversationId()"
                [class.border-primary-600]="conversation.id === currentConversationId()">
                <p class="text-sm font-medium text-secondary-900 truncate">
                  {{ conversation.title ?? 'Nouvelle conversation' }}
                </p>
                <p class="text-xs text-secondary-500 mt-1">
                  {{ formatDate(conversation.updatedAt) }}
                </p>
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ChatHistoryComponent {
  conversations = input<Conversation[]>([]);
  currentConversationId = input<string | undefined>();
  selectConversation = output<Conversation>();
  newConversation = output<void>();

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;

    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }
}
