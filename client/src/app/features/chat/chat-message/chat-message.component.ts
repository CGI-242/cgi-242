import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioButtonComponent } from '@shared/components/audio-button/audio-button.component';

interface Citation {
  articleNumber: string;
  title?: string;
  excerpt: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  citations?: Citation[];
  cgiVersion?: string;
}

@Component({
  selector: 'app-chat-message',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AudioButtonComponent],
  template: `
    <div class="flex gap-3 chat-message" [class.flex-row-reverse]="message.role === 'USER'">
      <!-- Avatar -->
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        [class.bg-primary-100]="message.role === 'ASSISTANT'"
        [class.bg-primary-600]="message.role === 'USER'">
        @if (message.role === 'ASSISTANT') {
          <span class="text-primary-600 text-xs font-bold">CGI</span>
        } @else {
          <span class="text-white text-xs font-bold">{{ userInitials }}</span>
        }
      </div>

      <!-- Content -->
      <div class="max-w-[80%] space-y-2">
        <div
          class="rounded-2xl p-4"
          [class.bg-primary-600]="message.role === 'USER'"
          [class.text-white]="message.role === 'USER'"
          [class.rounded-tr-none]="message.role === 'USER'"
          [class.bg-white]="message.role === 'ASSISTANT'"
          [class.border]="message.role === 'ASSISTANT'"
          [class.border-secondary-200]="message.role === 'ASSISTANT'"
          [class.rounded-tl-none]="message.role === 'ASSISTANT'">
          <p class="whitespace-pre-wrap text-sm">{{ message.content }}</p>

          <!-- Audio button for assistant messages -->
          @if (message.role === 'ASSISTANT') {
            <div class="flex gap-2 mt-3 pt-2 border-t border-secondary-100">
              <app-audio-button [text]="message.content" size="small" />
            </div>
          }
        </div>

        <!-- Source -->
        @if (message.citations && message.citations.length > 0) {
          <p class="text-xs text-secondary-500 italic">Source : CGI {{ message.cgiVersion || '2026' }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .chat-message {
      margin-bottom: 24px;
    }
  `]
})
export class ChatMessageComponent {
  @Input({ required: true }) message!: Message;
  @Input() userInitials = 'U';
}
