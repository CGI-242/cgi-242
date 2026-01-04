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
  id: string;
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
              <p class="text-xs text-white/70">La fiscalité congolaise, simplifiée.</p>
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
      content: 'Bonjour ! Je suis là pour répondre à vos questions sur CGI 242. Comment puis-je vous aider ?',
    },
  ]);

  quickQuestions = [
    "C'est quoi CGI 242 ?",
    'Quels sont les tarifs ?',
    'Quels impôts sont couverts ?',
    'Essai gratuit ?',
  ];

  // Mots-clés pour les salutations
  private greetings = ['bonjour', 'bonsoir', 'salut', 'hello', 'hi', 'coucou', 'hey'];

  private faqs: FAQ[] = [
    // Salutations
    {
      id: 'greeting',
      keywords: this.greetings,
      answer: `Bonjour ! 👋 Bienvenue sur CGI 242.

Je suis là pour répondre à vos questions sur notre plateforme. Vous pouvez me demander :

• Ce qu'est CGI 242
• Les tarifs et abonnements
• Les fonctionnalités disponibles
• Comment ça fonctionne

Comment puis-je vous aider ?`,
    },
    // À propos
    {
      id: 'about_1',
      keywords: ['quoi', 'cgi 242', "c'est quoi", 'kesako', 'présentation', 'définition', 'assistant', 'application', 'plateforme'],
      answer: `🔍 CGI 242 est un assistant fiscal intelligent spécialisé dans le Code Général des Impôts du Congo-Brazzaville.

Il combine l'intelligence artificielle et une base documentaire officielle pour vous fournir des réponses précises, sourcées et actualisées sur la fiscalité congolaise.

Fonctionnalités principales :
• Poser des questions fiscales en langage naturel
• Obtenir des réponses avec les articles du CGI cités
• Consulter le livre du CGI 2025 et 2026
• Utiliser des simulateurs fiscaux`,
    },
    {
      id: 'about_2',
      keywords: ['nom', 'signification', '242', 'pourquoi'],
      answer: `CGI pour Code Général des Impôts, et 242 pour l'indicatif téléphonique du Congo-Brazzaville.

Un nom qui reflète notre mission : rendre la fiscalité congolaise accessible à tous les professionnels.`,
    },
    {
      id: 'about_3',
      keywords: ['utilisateurs', 'cible', 'professionnels', 'comptables', 'pour qui', 'destiné'],
      answer: `👥 CGI 242 s'adresse à :

• Experts-comptables et cabinets d'audit
• Directions financières d'entreprises
• Fiscalistes et juristes d'affaires
• Entrepreneurs et PME
• Étudiants en comptabilité et fiscalité`,
    },
    // Contenu et sources
    {
      id: 'content_1',
      keywords: ['sources', 'textes officiels', 'fiable', 'confiance'],
      answer: `📚 CGI 242 s'appuie exclusivement sur les textes officiels :

• Code Général des Impôts 2025 et 2026 (Tomes 1 et 2)
• Directive CEMAC n°0119/25-UEAC-177-CM-42
• Textes réglementaires et circulaires fiscales

Chaque réponse cite les articles correspondants pour vérification.`,
    },
    {
      id: 'content_3',
      keywords: ['impôts', 'impot', 'couvert', 'IS', 'IBA', 'ITS', 'TVA', 'patente', 'pétrole'],
      answer: `💼 CGI 242 couvre l'ensemble de la fiscalité congolaise :

• Impôt sur les Sociétés (IS)
• Impôt sur les Bénéfices d'Affaires (IBA)
• Impôt sur les Traitements et Salaires (ITS)
• TVA
• Patente et contributions diverses
• Fiscalité pétrolière et minière
• Prix de transfert et fiscalité internationale`,
    },
    {
      id: 'content_4',
      keywords: ['2026', 'nouveautés', 'CEMAC', 'nouveau'],
      answer: `📅 Oui, le CGI 2026 est inclus !

Il intègre toutes les modifications issues de la Directive CEMAC n°0119/25, notamment :

• Nouveaux taux d'IS à 25%
• Règles de prix de transfert
• Régime des sous-traitants pétroliers`,
    },
    // Fonctionnalités
    {
      id: 'features_1',
      keywords: ['comment', 'utiliser', 'fonctionne', 'marche', 'poser', 'question'],
      answer: `💡 C'est très simple :

1️⃣ Créez un compte gratuit
2️⃣ Posez votre question fiscale naturellement
   Ex: "Quel est le taux de l'IS ?"
3️⃣ L'IA analyse le CGI et vous répond avec les sources
4️⃣ Consultez les articles cités directement

L'assistant comprend le langage naturel !`,
    },
    {
      id: 'features_2',
      keywords: ['simulateur', 'calcul', 'calculer', 'simulation'],
      answer: `🧮 Simulateurs fiscaux disponibles :

• IS (Impôt sur les Sociétés)
• ITS (Impôt sur les Salaires)
• IRPP
• Patente (droit fixe et proportionnel)
• Plus-values immobilières et mobilières
• Retenues à la source

Tous accessibles après inscription !`,
    },
    {
      id: 'features_3',
      keywords: ['texte', 'intégral', 'article', 'consulter', 'livre', 'cgi'],
      answer: `📖 Vous pouvez accéder au texte complet du CGI :

• Naviguer par chapitre, section ou thématique
• Rechercher par mots-clés
• Consulter les articles 2025 et 2026

Le livre du CGI est intégré à l'application.`,
    },
    {
      id: 'features_5',
      keywords: ['citation', 'référence', 'article de loi', 'source'],
      answer: `📌 Oui, systématiquement !

Chaque réponse indique les articles du CGI correspondants (ex: Art. 86A, Art. 3, Art. 92J).

Vous pouvez ainsi vérifier et documenter vos positions fiscales.`,
    },
    // Tarifs
    {
      id: 'pricing_1',
      keywords: ['tarif', 'prix', 'cout', 'combien', 'abonnement', 'payer', 'formule'],
      answer: `💳 Nos formules d'abonnement :

🆓 Gratuit : 0 FCFA/mois
   10 questions/mois, simulateurs de base, accès CGI

💼 Professionnel : 15 000 FCFA/mois
   Questions illimitées, tous simulateurs, historique complet

🏢 Entreprise : Sur devis
   Multi-utilisateurs, espace organisation, formation incluse`,
    },
    {
      id: 'pricing_4',
      keywords: ['essai', 'gratuit', 'free', 'tester', 'demo', 'test'],
      answer: `✅ Oui, essai gratuit disponible !

• 10 questions par mois incluses
• Accès au livre du CGI complet
• Simulateurs fiscaux de base
• Aucune carte bancaire requise

Inscrivez-vous en 30 secondes pour essayer !`,
    },
    // Collaboration
    {
      id: 'collab_1',
      keywords: ['équipe', 'cabinet', 'entreprise', 'collaborateur', 'partage', 'team', 'multi'],
      answer: `👥 Mode collaboratif disponible :

• Inviter des collaborateurs
• Partager des recherches
• Créer des espaces par client/dossier
• Gérer les rôles et permissions

Idéal pour les cabinets comptables !`,
    },
    // Sécurité
    {
      id: 'security_1',
      keywords: ['sécurité', 'données', 'protection', 'confidentialité', 'privé'],
      answer: `🔐 Vos données sont protégées :

• Questions jamais partagées avec des tiers
• Données chiffrées en transit et au repos
• Aucune utilisation pour entraîner l'IA
• Historique supprimable à tout moment`,
    },
    // Support
    {
      id: 'support_1',
      keywords: ['contact', 'aide', 'support', 'problème', 'email', 'téléphone'],
      answer: `🆘 Besoin d'aide ?

📧 Email : support@cgi242.com
📧 Commercial : contact@cgi-242.com
💬 Chat : Disponible dans l'application

Nous répondons sous 24h ouvrées.`,
    },
    // Légal
    {
      id: 'legal_1',
      keywords: ['conseil', 'responsabilité', 'avocat', 'expert-comptable', 'remplace'],
      answer: `⚖️ Avertissement important :

CGI 242 est un outil d'aide à la recherche. Pour les situations complexes, consultez un expert-comptable ou avocat fiscaliste.

L'application fournit l'information légale, seul un professionnel peut engager sa responsabilité sur un conseil personnalisé.`,
    },
    // Inscription
    {
      id: 'signup',
      keywords: ['inscription', 'inscrire', 'compte', 'créer', 'register', 'signup'],
      answer: `📝 Pour créer votre compte :

1. Cliquez sur "S'inscrire" en haut de la page
2. Renseignez votre email et mot de passe
3. Confirmez votre email
4. C'est prêt !

L'inscription est gratuite et prend 30 secondes.`,
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
