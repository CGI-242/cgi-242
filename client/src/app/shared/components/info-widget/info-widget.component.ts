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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface FAQ {
  keywords: string[];
  answer: string;
}

@Component({
  selector: 'app-info-widget',
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
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </button>

    <!-- Chat popup -->
    @if (isOpen()) {
      <div
        class="fixed bottom-6 right-6 w-[380px] h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-secondary-200 animate-slide-up">
        <!-- Header -->
        <div class="h-14 bg-primary-600 px-4 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-white text-sm">Questions sur CGI 242</h3>
              <p class="text-xs text-white/70">Comment pouvons-nous vous aider ?</p>
            </div>
          </div>
          <button
            (click)="toggleChat()"
            class="w-8 h-8 hover:bg-white/10 rounded-full flex items-center justify-center transition">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div #messagesContainer class="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary-50">
          @for (message of messages(); track message.id) {
            <div class="flex gap-2" [class.flex-row-reverse]="message.role === 'user'">
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                [class.bg-primary-100]="message.role === 'assistant'"
                [class.bg-primary-600]="message.role === 'user'">
                @if (message.role === 'assistant') {
                  <svg class="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                } @else {
                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                }
              </div>
              <div
                class="max-w-[85%] rounded-xl px-3 py-2 text-sm"
                [class.bg-primary-600]="message.role === 'user'"
                [class.text-white]="message.role === 'user'"
                [class.rounded-tr-none]="message.role === 'user'"
                [class.bg-white]="message.role === 'assistant'"
                [class.border]="message.role === 'assistant'"
                [class.border-secondary-200]="message.role === 'assistant'"
                [class.rounded-tl-none]="message.role === 'assistant'">
                <p class="whitespace-pre-wrap">{{ message.content }}</p>
              </div>
            </div>
          }

          @if (isTyping()) {
            <div class="flex gap-2">
              <div class="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="bg-white border border-secondary-200 rounded-xl rounded-tl-none px-3 py-2">
                <div class="flex items-center gap-1">
                  <div class="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce"></div>
                  <div class="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Quick questions -->
        @if (messages().length <= 1) {
          <div class="px-4 py-2 bg-white border-t border-secondary-100">
            <p class="text-xs text-secondary-500 mb-2">Questions frequentes :</p>
            <div class="flex flex-wrap gap-1.5">
              @for (q of quickQuestions; track q) {
                <button
                  (click)="askQuestion(q)"
                  class="text-xs bg-secondary-100 hover:bg-secondary-200 text-secondary-700 px-2.5 py-1 rounded-full transition">
                  {{ q }}
                </button>
              }
            </div>
          </div>
        }

        <!-- Input -->
        <div class="border-t border-secondary-200 bg-white p-3 flex-shrink-0">
          <form (ngSubmit)="onSubmit()" class="flex items-end gap-2">
            <textarea
              [(ngModel)]="messageInput"
              name="message"
              rows="1"
              class="flex-1 resize-none min-h-[40px] max-h-20 px-3 py-2 border border-secondary-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Posez votre question..."
              (keydown.enter)="handleEnterKey($event)"
              (input)="autoResize($event)">
            </textarea>
            <button
              type="submit"
              [disabled]="!messageInput.trim() || isTyping()"
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
export class InfoWidgetComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = signal(false);
  isTyping = signal(false);
  messageInput = '';
  messages = signal<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis la pour repondre a vos questions sur CGI 242. Comment puis-je vous aider ?',
    },
  ]);

  quickQuestions = [
    "C'est quoi CGI 242 ?",
    'Quels sont les tarifs ?',
    'Comment ca marche ?',
    'Essai gratuit ?',
  ];

  private faqs: FAQ[] = [
    {
      keywords: ['quoi', 'cgi 242', "c'est quoi", 'kesako', 'application', 'plateforme'],
      answer: `CGI 242 est un assistant IA specialise dans le Code General des Impots du Congo-Brazzaville.

Il vous permet de :
• Poser des questions fiscales en langage naturel
• Obtenir des reponses precises avec les articles du CGI cites
• Consulter le livre du CGI 2025 et 2026
• Utiliser des simulateurs fiscaux (IS, ITS, IRPP, Patente...)
• Travailler en equipe avec votre cabinet ou entreprise`,
    },
    {
      keywords: ['tarif', 'prix', 'cout', 'combien', 'abonnement', 'payer'],
      answer: `Nos formules d'abonnement :

🆓 Gratuit : 10 questions/mois
   Acces au CGI, simulateurs de base

💼 Basic : 15 000 FCFA/mois
   100 questions/mois, historique complet

🏢 Pro : 45 000 FCFA/mois
   Questions illimitees, equipe jusqu'a 5 personnes

🏛️ Entreprise : Sur devis
   Equipes illimitees, support prioritaire`,
    },
    {
      keywords: ['marche', 'fonctionne', 'comment', 'utiliser', 'fonctionnement'],
      answer: `C'est tres simple :

1️⃣ Creez un compte gratuit
2️⃣ Posez votre question fiscale (ex: "Quel est le taux de l'IS ?")
3️⃣ L'IA analyse le CGI et vous repond avec les articles sources
4️⃣ Vous pouvez consulter les articles cites directement

L'assistant comprend le langage naturel, pas besoin de connaitre les numeros d'articles !`,
    },
    {
      keywords: ['essai', 'gratuit', 'free', 'tester', 'demo', 'test'],
      answer: `Oui ! Vous pouvez commencer gratuitement :

✅ 10 questions par mois incluses
✅ Acces au livre du CGI complet
✅ Simulateurs fiscaux de base
✅ Aucune carte bancaire requise

Inscrivez-vous en 30 secondes pour essayer !`,
    },
    {
      keywords: ['inscription', 'inscrire', 'compte', 'creer', 'register', 'signup'],
      answer: `Pour creer votre compte :

1. Cliquez sur "S'inscrire" en haut de la page
2. Renseignez votre email et mot de passe
3. Confirmez votre email
4. C'est pret !

Vous pouvez aussi vous inscrire avec votre compte Google.`,
    },
    {
      keywords: ['equipe', 'cabinet', 'entreprise', 'collaborateur', 'partage', 'team'],
      answer: `Avec les plans Pro et Entreprise, vous pouvez :

👥 Inviter des collaborateurs
📁 Partager des conversations
🔒 Gerer les roles et permissions
📊 Suivre l'utilisation de l'equipe

Ideal pour les cabinets comptables et les directions fiscales !`,
    },
    {
      keywords: ['cgi', 'code', 'impot', 'fiscal', 'loi', 'article', '2025', '2026'],
      answer: `CGI 242 couvre le Code General des Impots du Congo :

📚 CGI 2025 : Version complete disponible
📚 CGI 2026 : Nouvelle version avec les mises a jour LF 2026

Tous les impots sont couverts : IS, ITS, TVA, IRPP, Patente, droits d'enregistrement...

Pour des questions fiscales precises, inscrivez-vous pour acceder a l'assistant complet !`,
    },
    {
      keywords: ['simulateur', 'calcul', 'calculer', 'simulation'],
      answer: `Nos simulateurs fiscaux disponibles :

🧮 Simulateur IS (Impot sur les Societes)
🧮 Simulateur ITS (Impot sur les Salaires)
🧮 Simulateur IRPP
🧮 Simulateur Patente
🧮 Calculateur d'acomptes IS

Tous accessibles apres inscription !`,
    },
    {
      keywords: ['contact', 'aide', 'support', 'probleme', 'question'],
      answer: `Besoin d'aide ?

📧 Email : support@cgi242.com
💬 Chat : Inscrivez-vous pour acceder au chat fiscal complet

Pour les questions fiscales, l'assistant IA vous repondra directement apres inscription.`,
    },
  ];

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
    const q = question.toLowerCase();

    for (const faq of this.faqs) {
      if (faq.keywords.some((kw) => q.includes(kw))) {
        return faq.answer;
      }
    }

    return `Merci pour votre question !

Pour obtenir des reponses detaillees sur la fiscalite congolaise, inscrivez-vous gratuitement a CGI 242.

L'assistant IA pourra alors repondre a toutes vos questions fiscales avec les articles du CGI correspondants.

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
