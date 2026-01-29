import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mentions-legales',
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
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Mentions Légales</h1>
          <p class="text-gray-500 mb-8">Dernière mise à jour : Janvier 2026</p>

          <!-- Section 1 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">1. Éditeur du site</h2>
            <p class="text-gray-700 mb-4">
              Le site https://cgi242.normx-ai.com est édité par :
            </p>
            <div class="bg-gray-50 rounded-lg p-4">
              <table class="w-full text-sm">
                <tbody>
                  <tr><td class="py-1 text-gray-600 w-1/3">Raison sociale</td><td class="py-1 text-gray-900 font-medium">ETS MG ADVISE</td></tr>
                  <tr><td class="py-1 text-gray-600">Forme juridique</td><td class="py-1 text-gray-900">Établissement commercial</td></tr>
                  <tr><td class="py-1 text-gray-600">Siège social</td><td class="py-1 text-gray-900">Pointe-Noire / Brazzaville, République du Congo</td></tr>
                  <tr><td class="py-1 text-gray-600">Téléphone</td><td class="py-1 text-gray-900">+242 05 203 42 21 / +242 05 379 99 59</td></tr>
                  <tr><td class="py-1 text-gray-600">Email</td><td class="py-1 text-gray-900">contact&#64;normx-ai.com</td></tr>
                  <tr><td class="py-1 text-gray-600">RCCM</td><td class="py-1 text-gray-900">CG-PNR-01-2023-A10-01130</td></tr>
                  <tr><td class="py-1 text-gray-600">NUI</td><td class="py-1 text-gray-900">P220000001491719</td></tr>
                  <tr><td class="py-1 text-gray-600">SCIEn</td><td class="py-1 text-gray-900">2024818</td></tr>
                  <tr><td class="py-1 text-gray-600">SCIET</td><td class="py-1 text-gray-900">2024818013</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Section 2 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">2. Hébergement</h2>
            <div class="bg-gray-50 rounded-lg p-4">
              <table class="w-full text-sm">
                <tbody>
                  <tr><td class="py-1 text-gray-600 w-1/3">Raison sociale</td><td class="py-1 text-gray-900 font-medium">OVH SAS</td></tr>
                  <tr><td class="py-1 text-gray-600">Adresse</td><td class="py-1 text-gray-900">2 rue Kellermann, 59100 Roubaix, France</td></tr>
                  <tr><td class="py-1 text-gray-600">Téléphone</td><td class="py-1 text-gray-900">+33 9 72 10 10 07</td></tr>
                  <tr><td class="py-1 text-gray-600">Site web</td><td class="py-1 text-gray-900">https://www.ovhcloud.com</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Section 3 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">3. Propriété intellectuelle</h2>

            <h3 class="font-medium text-gray-900 mb-2">3.1 Marque</h3>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p class="text-blue-800">
                <strong>NORMX AI</strong> est une marque déposée à l'Institut National de la Propriété Industrielle (INPI)
                sous le numéro <strong>5146181</strong>.
              </p>
            </div>
            <p class="text-gray-700 mb-4">
              Toute reproduction ou utilisation non autorisée de cette marque est strictement interdite.
            </p>

            <h3 class="font-medium text-gray-900 mb-2">3.2 Contenus</h3>
            <p class="text-gray-700 mb-4">
              L'ensemble des éléments du site (textes, images, logos, design, code source, bases de données, fonctionnalités)
              sont protégés par le droit de la propriété intellectuelle.
            </p>

            <h3 class="font-medium text-gray-900 mb-2">3.3 Code Général des Impôts</h3>
            <p class="text-gray-700">
              Le Code Général des Impôts de la République du Congo (Loi n°28-2024) est un texte officiel public.
              La mise en forme, l'indexation et les enrichissements apportés par CGI 242 sont la propriété d'ETS MG ADVISE.
            </p>
          </section>

          <!-- Section 4 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">4. Données personnelles</h2>

            <h3 class="font-medium text-gray-900 mb-2">Responsable du traitement</h3>
            <p class="text-gray-700 mb-4">
              ETS MG ADVISE est responsable du traitement des données personnelles collectées sur le site.
            </p>

            <h3 class="font-medium text-gray-900 mb-2">Finalités</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Gestion des comptes utilisateurs</li>
              <li>Fourniture des services</li>
              <li>Facturation et paiement</li>
              <li>Amélioration de nos services</li>
            </ul>

            <h3 class="font-medium text-gray-900 mb-2">Vos droits</h3>
            <p class="text-gray-700 mb-4">
              Vous disposez des droits d'accès, rectification, suppression, opposition et portabilité.
              Pour les exercer : contact&#64;normx-ai.com
            </p>

            <p class="text-gray-700">
              Pour plus de détails, consultez notre
              <a routerLink="/confidentialite" class="text-blue-600 hover:underline">Politique de Confidentialité</a>.
            </p>
          </section>

          <!-- Section 5 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">5. Cookies</h2>
            <p class="text-gray-700 mb-2">Le site utilise des cookies pour :</p>
            <ul class="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Cookies essentiels :</strong> bon fonctionnement du site</li>
              <li><strong>Cookies fonctionnels :</strong> mémoriser vos préférences</li>
              <li><strong>Cookies analytiques :</strong> analyser l'utilisation du site</li>
            </ul>
          </section>

          <!-- Section 6 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">6. Limitation de responsabilité</h2>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul class="text-yellow-800 space-y-2 text-sm">
                <li><strong>Information générale :</strong> Les informations ne constituent pas un conseil juridique ou fiscal personnalisé.</li>
                <li><strong>Exactitude :</strong> ETS MG ADVISE ne peut garantir l'exactitude absolue des informations.</li>
                <li><strong>Disponibilité :</strong> L'accès au site n'est pas garanti sans interruption.</li>
              </ul>
            </div>
          </section>

          <!-- Section 7 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">7. Droit applicable</h2>
            <ul class="text-gray-700 space-y-2">
              <li><strong>Droit applicable :</strong> Droit de la République du Congo</li>
              <li><strong>Juridiction :</strong> Tribunaux de Pointe-Noire (après tentative de résolution amiable)</li>
            </ul>
          </section>

          <!-- Section 8 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">8. Contact</h2>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-900 font-medium">ETS MG ADVISE</p>
              <p class="text-gray-700">Téléphone : +242 05 203 42 21 / +242 05 379 99 59</p>
              <p class="text-gray-700">Email : contact&#64;normx-ai.com</p>
              <p class="text-gray-700">Site : https://cgi242.normx-ai.com</p>
            </div>
          </section>

          <!-- Section 9 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">9. Crédits</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <tbody>
                  <tr class="border-b border-gray-200">
                    <td class="py-2 text-gray-600">Conception et développement</td>
                    <td class="py-2 text-gray-900">NORMX AI</td>
                  </tr>
                  <tr class="border-b border-gray-200">
                    <td class="py-2 text-gray-600">Design</td>
                    <td class="py-2 text-gray-900">NORMX AI</td>
                  </tr>
                  <tr class="border-b border-gray-200">
                    <td class="py-2 text-gray-600">Hébergement</td>
                    <td class="py-2 text-gray-900">OVH</td>
                  </tr>
                  <tr>
                    <td class="py-2 text-gray-600">Paiements</td>
                    <td class="py-2 text-gray-900">CinetPay</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Footer -->
          <footer class="mt-12 pt-8 border-t border-gray-200 text-center">
            <p class="text-gray-500 text-sm mb-4">
              Voir aussi :
              <a routerLink="/cgv" class="text-blue-600 hover:underline">CGV</a> |
              <a routerLink="/cgu" class="text-blue-600 hover:underline">CGU</a> |
              <a routerLink="/confidentialite" class="text-blue-600 hover:underline">Politique de Confidentialité</a>
            </p>
            <p class="text-gray-500 text-sm">
              © 2026 ETS MG ADVISE - NORMX AI - Tous droits réservés
            </p>
          </footer>
        </article>
      </main>
    </div>
  `,
})
export class MentionsLegalesComponent {}
