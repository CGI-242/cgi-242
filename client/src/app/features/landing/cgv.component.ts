import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cgv',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2">
            <span class="text-xl font-bold text-blue-600">CGI 242</span>
          </a>
          <a routerLink="/" class="text-gray-600 hover:text-blue-600 text-sm">
            ← Retour à l'accueil
          </a>
        </div>
      </header>

      <!-- Content -->
      <main class="max-w-4xl mx-auto px-4 py-8">
        <article class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Conditions Générales de Vente</h1>
          <p class="text-gray-500 mb-8">Dernière mise à jour : Janvier 2026</p>

          <!-- Article 1 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 1 - Objet</h2>
            <p class="text-gray-700 mb-4">
              Les présentes Conditions Générales de Vente régissent les relations contractuelles entre :
            </p>
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <p class="font-medium text-gray-900">Le Vendeur :</p>
              <ul class="text-gray-700 mt-2 space-y-1">
                <li><strong>Raison sociale :</strong> ETS MG ADVISE</li>
                <li><strong>Siège social :</strong> Pointe-Noire / Brazzaville, République du Congo</li>
                <li><strong>Email :</strong> contact&#64;normx-ai.com</li>
                <li><strong>Site web :</strong> https://cgi242.normx-ai.com</li>
              </ul>
            </div>
            <p class="text-gray-700">
              <strong>Et le Client :</strong> Toute personne physique ou morale souscrivant à un abonnement sur la plateforme CGI 242.
            </p>
          </section>

          <!-- Article 2 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 2 - Description des services</h2>

            <h3 class="font-medium text-gray-900 mb-2">2.1 Présentation</h3>
            <p class="text-gray-700 mb-4">CGI 242 est une plateforme numérique proposant :</p>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li><strong>Recherche sémantique :</strong> Accès au Code Général des Impôts du Congo</li>
              <li><strong>Assistant IA :</strong> Réponses aux questions fiscales</li>
              <li><strong>Simulateurs fiscaux :</strong> Calcul IS, TVA, ITS, IRPP</li>
              <li><strong>Calendrier fiscal :</strong> Échéances et rappels personnalisés</li>
            </ul>

            <h3 class="font-medium text-gray-900 mb-2">2.2 Formules disponibles</h3>
            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border border-gray-200 px-3 py-2 text-left">Formule</th>
                    <th class="border border-gray-200 px-3 py-2 text-left">Prix/mois</th>
                    <th class="border border-gray-200 px-3 py-2 text-left">Questions</th>
                    <th class="border border-gray-200 px-3 py-2 text-left">Membres</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-gray-200 px-3 py-2 font-medium">GRATUIT</td>
                    <td class="border border-gray-200 px-3 py-2">0 XAF</td>
                    <td class="border border-gray-200 px-3 py-2">10</td>
                    <td class="border border-gray-200 px-3 py-2">1</td>
                  </tr>
                  <tr class="bg-gray-50">
                    <td class="border border-gray-200 px-3 py-2 font-medium">STARTER</td>
                    <td class="border border-gray-200 px-3 py-2">9 900 XAF</td>
                    <td class="border border-gray-200 px-3 py-2">100</td>
                    <td class="border border-gray-200 px-3 py-2">1</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-200 px-3 py-2 font-medium">PROFESSIONNEL</td>
                    <td class="border border-gray-200 px-3 py-2">29 900 XAF</td>
                    <td class="border border-gray-200 px-3 py-2">Illimité</td>
                    <td class="border border-gray-200 px-3 py-2">1</td>
                  </tr>
                  <tr class="bg-gray-50">
                    <td class="border border-gray-200 px-3 py-2 font-medium">TEAM</td>
                    <td class="border border-gray-200 px-3 py-2">79 900 XAF</td>
                    <td class="border border-gray-200 px-3 py-2">500</td>
                    <td class="border border-gray-200 px-3 py-2">5</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-200 px-3 py-2 font-medium">ENTERPRISE</td>
                    <td class="border border-gray-200 px-3 py-2">Sur devis</td>
                    <td class="border border-gray-200 px-3 py-2">Illimité</td>
                    <td class="border border-gray-200 px-3 py-2">Illimité</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 class="font-medium text-gray-900 mb-2">2.3 Limites du service</h3>
            <p class="text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              CGI 242 est un outil d'aide à la décision. Les informations fournies ne constituent pas un conseil juridique personnalisé. Pour toute décision importante, consultez un professionnel qualifié.
            </p>
          </section>

          <!-- Article 3 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 3 - Prix</h2>
            <p class="text-gray-700 mb-2">
              Les prix sont exprimés en Francs CFA (XAF) et s'entendent TTC, incluant la TVA au taux en vigueur (18%).
            </p>
            <p class="text-gray-700">
              ETS MG ADVISE peut modifier ses prix à tout moment. Les nouveaux tarifs s'appliquent aux nouvelles souscriptions et renouvellements.
            </p>
          </section>

          <!-- Article 4 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 4 - Commande et souscription</h2>
            <ol class="list-decimal list-inside text-gray-700 space-y-1">
              <li>Sélection de la formule sur le site</li>
              <li>Création de compte ou connexion</li>
              <li>Acceptation des CGV</li>
              <li>Paiement</li>
              <li>Confirmation par email avec facture</li>
            </ol>
          </section>

          <!-- Article 5 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 5 - Modalités de paiement</h2>
            <h3 class="font-medium text-gray-900 mb-2">Moyens acceptés :</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li><strong>Mobile Money :</strong> MTN Mobile Money, Airtel Money (via CinetPay)</li>
              <li><strong>Carte bancaire :</strong> Visa, Mastercard (via CinetPay)</li>
            </ul>
            <p class="text-gray-700 text-sm">
              Les paiements sont sécurisés par CinetPay, certifié PCI-DSS. ETS MG ADVISE ne stocke aucune donnée bancaire.
            </p>
          </section>

          <!-- Article 6 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 6 - Accès au service</h2>
            <ul class="text-gray-700 space-y-2">
              <li><strong>Activation :</strong> L'accès est activé immédiatement après confirmation du paiement.</li>
              <li><strong>Identifiants :</strong> Le Client est responsable de la confidentialité de ses identifiants.</li>
              <li><strong>Disponibilité :</strong> ETS MG ADVISE s'efforce d'assurer une disponibilité 24h/24, 7j/7.</li>
            </ul>
          </section>

          <!-- Article 7 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 7 - Durée et renouvellement</h2>
            <p class="text-gray-700 mb-2">
              Abonnement mensuel avec renouvellement automatique sauf résiliation par le Client.
            </p>
            <p class="text-gray-700">
              Les données sont conservées 6 mois après expiration.
            </p>
          </section>

          <!-- Article 8 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 8 - Résiliation</h2>
            <ul class="text-gray-700 space-y-2">
              <li><strong>Par le Client :</strong> Résiliation à tout moment depuis l'espace client ou par email. Prend effet à la fin du mois en cours.</li>
              <li><strong>Par ETS MG ADVISE :</strong> Possible en cas de défaut de paiement, violation des CGU ou utilisation frauduleuse.</li>
              <li><strong>Export :</strong> Le Client peut demander l'export de ses données dans les 30 jours suivant la résiliation.</li>
            </ul>
          </section>

          <!-- Article 9 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 9 - Droit de rétractation</h2>
            <p class="text-gray-700">
              Le droit de rétractation ne s'applique pas aux services numériques dont l'exécution a commencé avec l'accord du consommateur.
            </p>
          </section>

          <!-- Article 10 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 10 - Propriété intellectuelle</h2>
            <p class="text-gray-700 mb-4">
              La plateforme CGI 242 est la propriété exclusive d'ETS MG ADVISE et de la marque NORMX AI (INPI n°5146181).
            </p>
            <p class="text-gray-700 mb-2">
              L'abonnement confère un droit d'utilisation personnel, non exclusif et non transférable.
            </p>
            <p class="text-gray-700 font-medium">Interdictions :</p>
            <ul class="list-disc list-inside text-gray-700 space-y-1">
              <li>Reproduction ou copie du contenu</li>
              <li>Revente ou sous-licence</li>
              <li>Accès au code source</li>
              <li>Utilisation de robots automatisés</li>
            </ul>
          </section>

          <!-- Article 11 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 11 - Responsabilité</h2>
            <ul class="text-gray-700 space-y-2">
              <li><strong>Limitation :</strong> ETS MG ADVISE ne peut garantir l'exactitude absolue des informations fiscales ni l'absence d'interruptions.</li>
              <li><strong>Exclusion :</strong> ETS MG ADVISE n'est pas responsable des décisions du Client basées sur les informations fournies.</li>
              <li><strong>Plafond :</strong> La responsabilité est limitée au montant de l'abonnement des 12 derniers mois.</li>
            </ul>
          </section>

          <!-- Article 12 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 12 - Données personnelles</h2>
            <p class="text-gray-700">
              Le traitement des données personnelles est régi par notre
              <a routerLink="/confidentialite" class="text-blue-600 hover:underline">Politique de Confidentialité</a>.
            </p>
          </section>

          <!-- Article 13 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 13 - Force majeure</h2>
            <p class="text-gray-700">
              ETS MG ADVISE ne sera pas responsable en cas de force majeure (catastrophe naturelle, guerre, panne d'internet, décision gouvernementale).
            </p>
          </section>

          <!-- Article 14 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 14 - Modification des CGV</h2>
            <p class="text-gray-700">
              Les modifications seront notifiées par email et prendront effet 30 jours après notification.
            </p>
          </section>

          <!-- Article 15 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 15 - Litiges</h2>
            <ul class="text-gray-700 space-y-2">
              <li><strong>Réclamations :</strong> contact&#64;normx-ai.com</li>
              <li><strong>Médiation :</strong> Les parties s'engagent à rechercher une solution amiable avant toute action judiciaire.</li>
              <li><strong>Juridiction :</strong> Tribunaux de Pointe-Noire (République du Congo)</li>
              <li><strong>Droit applicable :</strong> Droit congolais</li>
            </ul>
          </section>

          <!-- Footer -->
          <footer class="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p class="font-medium text-gray-700">ETS MG ADVISE</p>
            <p>contact&#64;normx-ai.com</p>
            <p class="mt-4">© 2026 NORMX AI - Marque déposée INPI n°5146181 - Tous droits réservés</p>
          </footer>
        </article>
      </main>
    </div>
  `,
})
export class CgvComponent {}
