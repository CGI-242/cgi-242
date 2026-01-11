import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-confidentialite',
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
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Politique de Confidentialité</h1>
          <p class="text-gray-500 mb-8">Dernière mise à jour : Janvier 2026</p>

          <!-- Introduction -->
          <section class="mb-8">
            <p class="text-gray-700">
              ETS M ADVISE, éditeur de la plateforme CGI 242, s'engage à protéger la vie privée des utilisateurs.
              Cette politique décrit comment nous collectons, utilisons, stockons et protégeons vos données personnelles.
            </p>
          </section>

          <!-- Section 1 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">1. Responsable du traitement</h2>
            <div class="bg-gray-50 rounded-lg p-4">
              <ul class="text-gray-700 space-y-1">
                <li><strong>Responsable :</strong> ETS M ADVISE</li>
                <li><strong>Adresse :</strong> Pointe-Noire / Brazzaville, République du Congo</li>
                <li><strong>Email DPO :</strong> contact&#64;normx-ai.com</li>
              </ul>
            </div>
          </section>

          <!-- Section 2 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">2. Données collectées</h2>

            <h3 class="font-medium text-gray-900 mb-2">2.1 Données fournies par l'utilisateur</h3>
            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border border-gray-200 px-3 py-2 text-left">Donnée</th>
                    <th class="border border-gray-200 px-3 py-2 text-left">Finalité</th>
                    <th class="border border-gray-200 px-3 py-2 text-left">Obligatoire</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td class="border border-gray-200 px-3 py-2">Nom et prénom</td><td class="border border-gray-200 px-3 py-2">Identification</td><td class="border border-gray-200 px-3 py-2">Oui</td></tr>
                  <tr class="bg-gray-50"><td class="border border-gray-200 px-3 py-2">Email</td><td class="border border-gray-200 px-3 py-2">Connexion, communications</td><td class="border border-gray-200 px-3 py-2">Oui</td></tr>
                  <tr><td class="border border-gray-200 px-3 py-2">Mot de passe</td><td class="border border-gray-200 px-3 py-2">Sécurité (hashé)</td><td class="border border-gray-200 px-3 py-2">Oui</td></tr>
                  <tr class="bg-gray-50"><td class="border border-gray-200 px-3 py-2">Téléphone</td><td class="border border-gray-200 px-3 py-2">Support client</td><td class="border border-gray-200 px-3 py-2">Non</td></tr>
                </tbody>
              </table>
            </div>

            <h3 class="font-medium text-gray-900 mb-2">2.2 Données collectées automatiquement</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Adresse IP (sécurité, statistiques)</li>
              <li>Type de navigateur et OS</li>
              <li>Pages visitées et date de connexion</li>
            </ul>

            <h3 class="font-medium text-gray-900 mb-2">2.3 Données de paiement</h3>
            <p class="text-gray-700 bg-blue-50 border border-blue-200 rounded-lg p-4">
              Les données de paiement sont traitées directement par CinetPay et ne sont <strong>pas stockées</strong> sur nos serveurs.
              Nous conservons uniquement les références de transaction.
            </p>
          </section>

          <!-- Section 3 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">3. Finalités du traitement</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border border-gray-200 px-3 py-2 text-left">Finalité</th>
                    <th class="border border-gray-200 px-3 py-2 text-left">Base légale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td class="border border-gray-200 px-3 py-2">Gestion de compte</td><td class="border border-gray-200 px-3 py-2">Exécution du contrat</td></tr>
                  <tr class="bg-gray-50"><td class="border border-gray-200 px-3 py-2">Fourniture des services</td><td class="border border-gray-200 px-3 py-2">Exécution du contrat</td></tr>
                  <tr><td class="border border-gray-200 px-3 py-2">Facturation</td><td class="border border-gray-200 px-3 py-2">Exécution du contrat</td></tr>
                  <tr class="bg-gray-50"><td class="border border-gray-200 px-3 py-2">Amélioration des services</td><td class="border border-gray-200 px-3 py-2">Intérêt légitime</td></tr>
                  <tr><td class="border border-gray-200 px-3 py-2">Sécurité</td><td class="border border-gray-200 px-3 py-2">Intérêt légitime</td></tr>
                  <tr class="bg-gray-50"><td class="border border-gray-200 px-3 py-2">Communications commerciales</td><td class="border border-gray-200 px-3 py-2">Consentement</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Section 4 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">4. Partage des données</h2>

            <h3 class="font-medium text-gray-900 mb-2">Sous-traitants</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li><strong>OVH</strong> - Hébergement (France)</li>
              <li><strong>CinetPay</strong> - Paiements Mobile Money (Côte d'Ivoire)</li>
              <li><strong>Brevo</strong> - Emails transactionnels (France)</li>
            </ul>

            <p class="text-gray-700 bg-green-50 border border-green-200 rounded-lg p-4 font-medium">
              Nous ne vendons pas vos données. ETS M ADVISE ne partage pas vos données personnelles à des fins commerciales.
            </p>
          </section>

          <!-- Section 5 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">5. Durée de conservation</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border border-gray-200 px-3 py-2 text-left">Données</th>
                    <th class="border border-gray-200 px-3 py-2 text-left">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td class="border border-gray-200 px-3 py-2">Données de compte</td><td class="border border-gray-200 px-3 py-2">Durée abonnement + 3 ans</td></tr>
                  <tr class="bg-gray-50"><td class="border border-gray-200 px-3 py-2">Données de facturation</td><td class="border border-gray-200 px-3 py-2">10 ans (obligation légale)</td></tr>
                  <tr><td class="border border-gray-200 px-3 py-2">Logs de connexion</td><td class="border border-gray-200 px-3 py-2">1 an</td></tr>
                  <tr class="bg-gray-50"><td class="border border-gray-200 px-3 py-2">Questions IA</td><td class="border border-gray-200 px-3 py-2">1 an (anonymisées après)</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Section 6 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">6. Vos droits</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-medium text-gray-900">Droit d'accès</h3>
                <p class="text-gray-600 text-sm">Obtenir une copie de vos données</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-medium text-gray-900">Droit de rectification</h3>
                <p class="text-gray-600 text-sm">Corriger vos données inexactes</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-medium text-gray-900">Droit de suppression</h3>
                <p class="text-gray-600 text-sm">Demander la suppression de vos données</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-medium text-gray-900">Droit à la portabilité</h3>
                <p class="text-gray-600 text-sm">Recevoir vos données en format structuré</p>
              </div>
            </div>
            <p class="text-gray-700 mt-4">
              <strong>Exercice des droits :</strong> contact&#64;normx-ai.com - Réponse sous 30 jours.
            </p>
          </section>

          <!-- Section 7 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">7. Sécurité</h2>
            <ul class="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Chiffrement :</strong> HTTPS/TLS pour toutes les communications</li>
              <li><strong>Hashage :</strong> Mots de passe stockés hashés (bcrypt)</li>
              <li><strong>Authentification :</strong> JWT avec expiration, 2FA disponible</li>
              <li><strong>Accès restreint :</strong> Principe du moindre privilège</li>
              <li><strong>Sauvegardes :</strong> Chiffrées et géo-redondantes</li>
            </ul>
          </section>

          <!-- Section 8 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
            <div class="overflow-x-auto mb-4">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border border-gray-200 px-3 py-2 text-left">Type</th>
                    <th class="border border-gray-200 px-3 py-2 text-left">Finalité</th>
                    <th class="border border-gray-200 px-3 py-2 text-left">Consentement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td class="border border-gray-200 px-3 py-2">Essentiels</td><td class="border border-gray-200 px-3 py-2">Fonctionnement du site</td><td class="border border-gray-200 px-3 py-2">Non requis</td></tr>
                  <tr class="bg-gray-50"><td class="border border-gray-200 px-3 py-2">Authentification</td><td class="border border-gray-200 px-3 py-2">Maintien connexion</td><td class="border border-gray-200 px-3 py-2">Non requis</td></tr>
                  <tr><td class="border border-gray-200 px-3 py-2">Analytiques</td><td class="border border-gray-200 px-3 py-2">Statistiques d'usage</td><td class="border border-gray-200 px-3 py-2">Requis</td></tr>
                </tbody>
              </table>
            </div>
            <p class="text-gray-600 text-sm">
              Gérez vos préférences via le bandeau cookies ou les paramètres de votre navigateur.
            </p>
          </section>

          <!-- Section 9 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">9. Modifications</h2>
            <p class="text-gray-700">
              Cette politique peut être modifiée à tout moment. Les changements significatifs seront notifiés par email.
            </p>
          </section>

          <!-- Section 10 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">10. Contact</h2>
            <div class="bg-blue-50 rounded-lg p-4">
              <p class="text-gray-700"><strong>ETS M ADVISE</strong></p>
              <p class="text-gray-700">Email : contact&#64;normx-ai.com</p>
              <p class="text-gray-700">Objet : "Protection des données"</p>
            </div>
          </section>

          <!-- Footer -->
          <footer class="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>
              Voir aussi : <a routerLink="/cgv" class="text-blue-600 hover:underline">Conditions Générales de Vente</a>
            </p>
            <p class="mt-4">© 2026 ETS M ADVISE - NORMX AI - Tous droits réservés</p>
          </footer>
        </article>
      </main>
    </div>
  `,
})
export class ConfidentialiteComponent {}
