import { Component, Output, EventEmitter, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="border-t border-secondary-200 bg-white p-4">
      <form (ngSubmit)="onSubmit()" class="max-w-4xl mx-auto">
        <div class="flex items-end gap-3">
          <div class="flex-1 relative">
            <textarea
              [(ngModel)]="message"
              name="message"
              rows="1"
              class="input resize-none min-h-[44px] max-h-32 pr-12"
              placeholder="Posez votre question sur le CGI..."
              (keydown.enter)="handleEnterKey($event)"
              (input)="autoResize($event)">
            </textarea>
          </div>
          <button
            type="submit"
            [disabled]="!message().trim()"
            class="btn-primary h-11 px-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
        <p class="text-xs text-secondary-400 mt-2 text-center">
          CGI 242 peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </form>
    </div>
  `,
})
export class ChatInputComponent {
  @Output() sendMessage = new EventEmitter<string>();

  message = signal('');

  onSubmit(): void {
    const content = this.message().trim();
    if (content) {
      this.sendMessage.emit(content);
      this.message.set('');
    }
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
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
  }
}
