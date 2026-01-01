import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  citations?: Citation[];
  confidence?: number;
  tokensUsed?: number;
  responseTime?: number;
  createdAt: string;
  authorId?: string;
}

export interface Citation {
  articleNumber: string;
  title?: string;
  excerpt: string;
}

export interface Conversation {
  id: string;
  title?: string;
  visibility: 'PRIVATE' | 'TEAM' | 'RESTRICTED';
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  organizationId?: string;
}

export interface SendMessageData {
  content: string;
  conversationId?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = inject(ApiService);

  conversations = signal<Conversation[]>([]);
  currentConversation = signal<Conversation | null>(null);
  isLoading = signal(false);

  loadConversations(): Observable<Conversation[]> {
    return this.api.get<Conversation[]>('/chat/conversations').pipe(
      map((res) => res.data ?? []),
      tap((convs) => this.conversations.set(convs))
    );
  }

  loadConversation(conversationId: string): Observable<Conversation | null> {
    return this.api.get<Conversation>(`/chat/conversations/${conversationId}`).pipe(
      map((res) => res.data ?? null),
      tap((conv) => this.currentConversation.set(conv))
    );
  }

  sendMessage(data: SendMessageData): Observable<ApiResponse<{ message: Message; conversation: Conversation }>> {
    this.isLoading.set(true);
    return this.api.post<{ message: Message; conversation: Conversation }, SendMessageData>(
      '/chat/message',
      data
    ).pipe(
      tap((res) => {
        this.isLoading.set(false);
        if (res.success && res.data?.conversation) {
          this.currentConversation.set(res.data.conversation);
          this.updateConversationInList(res.data.conversation);
        }
      })
    );
  }

  createConversation(title?: string): Observable<ApiResponse<Conversation>> {
    return this.api.post<Conversation, { title?: string }>('/chat/conversations', { title });
  }

  updateConversation(
    conversationId: string,
    data: { title?: string; visibility?: string }
  ): Observable<ApiResponse<Conversation>> {
    return this.api.put<Conversation, { title?: string; visibility?: string }>(
      `/chat/conversations/${conversationId}`,
      data
    );
  }

  deleteConversation(conversationId: string): Observable<ApiResponse<null>> {
    return this.api.delete<null>(`/chat/conversations/${conversationId}`).pipe(
      tap((res) => {
        if (res.success) {
          this.conversations.update((convs) =>
            convs.filter((c) => c.id !== conversationId)
          );
          if (this.currentConversation()?.id === conversationId) {
            this.currentConversation.set(null);
          }
        }
      })
    );
  }

  clearCurrentConversation(): void {
    this.currentConversation.set(null);
  }

  private updateConversationInList(conversation: Conversation): void {
    this.conversations.update((convs) => {
      const index = convs.findIndex((c) => c.id === conversation.id);
      if (index >= 0) {
        const updated = [...convs];
        updated[index] = conversation;
        return updated;
      }
      return [conversation, ...convs];
    });
  }
}
