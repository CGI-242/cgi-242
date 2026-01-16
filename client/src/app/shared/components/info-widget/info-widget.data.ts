/**
 * Données FAQ pour le widget d'information
 */

export interface FAQ {
  id: string;
  keywords: string[];
  answer: string;
}

export const GREETINGS = ['bonjour', 'bonsoir', 'salut', 'hello', 'hi', 'coucou', 'hey'];

export const QUICK_QUESTIONS = [
  "C'est quoi CGI 242 ?",
  'Quels sont les tarifs ?',
  'Quels impôts sont couverts ?',
  'Essai gratuit ?',
];

export const FAQS: FAQ[] = [
  // Salutations
  {
    id: 'greeting',
    keywords: GREETINGS,
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

📧 Email : support@normx-ai.com
📧 Commercial : contact@normx-ai.com
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
