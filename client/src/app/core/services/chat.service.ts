import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap, Subject } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';
import { environment } from '../../../environments/environment';

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

export interface StreamEvent {
  type: 'conversation' | 'start' | 'chunk' | 'citations' | 'done' | 'error';
  conversationId?: string;
  content?: string;
  citations?: Citation[];
  cgiVersion?: string;
  metadata?: {
    tokensUsed?: number;
    responseTime?: number;
    model?: string;
    cgiVersion?: string;
  };
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = inject(ApiService);

  conversations = signal<Conversation[]>([]);
  currentConversation = signal<Conversation | null>(null);
  isLoading = signal(false);

  // Streaming state
  isStreaming = signal(false);
  streamingContent = signal('');
  streamingCitations = signal<Citation[]>([]);
  streamingCgiVersion = signal<string>('2026');
  private abortController: AbortController | null = null;

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

  /**
   * Send message with SSE streaming
   * Returns an Observable that emits stream events
   */
  sendMessageStreaming(data: SendMessageData): Observable<StreamEvent> {
    const subject = new Subject<StreamEvent>();

    this.isStreaming.set(true);
    this.streamingContent.set('');
    this.streamingCitations.set([]);

    // Create abort controller for cancellation
    this.abortController = new AbortController();

    const url = `${environment.apiUrl}/chat/message/stream`;
    const token = localStorage.getItem('cgi_access_token');

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      signal: this.abortController.signal,
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            this.isStreaming.set(false);
            subject.complete();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process SSE events
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();

              if (data === '[DONE]') {
                this.isStreaming.set(false);
                subject.complete();
                return;
              }

              try {
                const event: StreamEvent = JSON.parse(data);
                this.handleStreamEvent(event);
                subject.next(event);
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      })
      .catch((error) => {
        this.isStreaming.set(false);
        if (error.name !== 'AbortError') {
          subject.error(error);
        }
      });

    return subject.asObservable();
  }

  /**
   * Cancel ongoing stream
   */
  cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.isStreaming.set(false);
    }
  }

  /**
   * Handle individual stream events
   */
  private handleStreamEvent(event: StreamEvent): void {
    switch (event.type) {
      case 'conversation':
        if (event.conversationId) {
          // Update current conversation ID
          this.currentConversation.update(conv => ({
            ...conv,
            id: event.conversationId!,
          } as Conversation));
        }
        break;

      case 'chunk':
        if (event.content) {
          this.streamingContent.update(content => content + event.content);
        }
        break;

      case 'citations':
        if (event.citations) {
          this.streamingCitations.set(event.citations);
        }
        if (event.cgiVersion) {
          this.streamingCgiVersion.set(event.cgiVersion);
        }
        break;

      case 'done':
        this.isStreaming.set(false);
        if (event.metadata?.cgiVersion) {
          this.streamingCgiVersion.set(event.metadata.cgiVersion);
        }
        break;

      case 'error':
        this.isStreaming.set(false);
        break;
    }
  }

  /**
   * Reset streaming state
   */
  resetStreamingState(): void {
    this.streamingContent.set('');
    this.streamingCitations.set([]);
    this.streamingCgiVersion.set('2026');
    this.isStreaming.set(false);
  }
}
