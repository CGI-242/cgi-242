import {
  Component,
  signal,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FAQ, GREETINGS, QUICK_QUESTIONS, FAQS } from './info-widget.data';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-info-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './info-widget.component.html',
  styleUrls: ['./info-widget.component.scss'],
})
export class InfoWidgetComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = signal(false);
  isTyping = signal(false);
  messageInput = '';
  messages = signal<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis là pour répondre à vos questions sur CGI 242. Comment puis-je vous aider ?',
    },
  ]);

  quickQuestions = QUICK_QUESTIONS;
  private greetings = GREETINGS;
  private faqs: FAQ[] = FAQS;

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
    this.isOpen.update((v) => !v);
  }

  askQuestion(question: string): void {
    this.messageInput = question;
    this.onSubmit();
  }

  onSubmit(): void {
    const content = this.messageInput.trim();
    if (!content || this.isTyping()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };
    this.messages.update((m) => [...m, userMessage]);
    this.messageInput = '';

    this.isTyping.set(true);

    // Simulate typing delay
    setTimeout(() => {
      const answer = this.findAnswer(content);
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer,
      };
      this.messages.update((m) => [...m, assistantMessage]);
      this.isTyping.set(false);
    }, 800);
  }

  private findAnswer(question: string): string {
    const q = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Vérifier d'abord les salutations
    if (this.greetings.some((g) => q.startsWith(g) || q === g)) {
      const hour = new Date().getHours();
      const greeting = hour < 18 ? 'Bonjour' : 'Bonsoir';
      return `${greeting} ! 👋 Bienvenue sur CGI 242.

Je suis là pour répondre à vos questions sur notre plateforme. Vous pouvez me demander :

• Ce qu'est CGI 242
• Les tarifs et abonnements
• Les fonctionnalités disponibles
• Comment ça fonctionne

Comment puis-je vous aider ?`;
    }

    // Chercher dans les FAQs
    for (const faq of this.faqs) {
      const normalizedKeywords = faq.keywords.map(kw =>
        kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      );
      if (normalizedKeywords.some((kw) => q.includes(kw))) {
        return faq.answer;
      }
    }

    return `Merci pour votre question !

Pour obtenir des réponses détaillées sur la fiscalité congolaise, inscrivez-vous gratuitement à CGI 242.

L'assistant IA pourra alors répondre à toutes vos questions fiscales avec les articles du CGI correspondants.

👉 Cliquez sur "S'inscrire" pour commencer`;
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
    textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
  }
}
