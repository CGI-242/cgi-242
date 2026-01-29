import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cgu',
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
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Conditions Générales d'Utilisation</h1>
          <p class="text-gray-500 mb-8">Dernière mise à jour : Janvier 2026</p>

          <!-- Article 1 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 1 - Objet</h2>
            <p class="text-gray-700">
              Les présentes Conditions Générales d'Utilisation (CGU) définissent les règles d'accès et
              d'utilisation de la plateforme CGI 242, accessible à l'adresse https://cgi242.normx-ai.com.
            </p>
            <p class="text-gray-700 mt-2 font-medium">
              En accédant à la plateforme, l'Utilisateur accepte sans réserve les présentes CGU.
            </p>
          </section>

          <!-- Article 2 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 2 - Définitions</h2>
            <ul class="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Plateforme :</strong> Le site web cgi242.normx-ai.com et applications associées</li>
              <li><strong>Éditeur :</strong> ETS MG ADVISE</li>
              <li><strong>Utilisateur :</strong> Toute personne accédant à la plateforme</li>
              <li><strong>Client :</strong> Utilisateur ayant souscrit un abonnement payant</li>
              <li><strong>Service :</strong> Ensemble des fonctionnalités proposées par la plateforme</li>
            </ul>
          </section>

          <!-- Article 3 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 3 - Accès à la plateforme</h2>

            <h3 class="font-medium text-gray-900 mb-2">3.1 Conditions d'accès</h3>
            <p class="text-gray-700 mb-4">
              L'accès à la plateforme est ouvert à toute personne disposant d'une connexion internet.
              Certaines fonctionnalités nécessitent la création d'un compte et/ou la souscription d'un abonnement.
            </p>

            <h3 class="font-medium text-gray-900 mb-2">3.2 Création de compte</h3>
            <p class="text-gray-700 mb-2">Pour créer un compte, l'Utilisateur doit :</p>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Être majeur ou disposer de l'autorisation de son représentant légal</li>
              <li>Fournir des informations exactes et complètes</li>
              <li>Accepter les présentes CGU et la Politique de Confidentialité</li>
            </ul>

            <h3 class="font-medium text-gray-900 mb-2">3.3 Identifiants</h3>
            <p class="text-gray-700">
              L'Utilisateur est responsable de la confidentialité de ses identifiants et s'engage à ne pas les partager.
            </p>
          </section>

          <!-- Article 4 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 4 - Services</h2>

            <h3 class="font-medium text-gray-900 mb-2">4.1 Services gratuits</h3>
            <ul class="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Consultation de la page d'accueil</li>
              <li>Présentation des fonctionnalités</li>
              <li>Accès limité à certains articles (aperçu)</li>
            </ul>

            <h3 class="font-medium text-gray-900 mb-2">4.2 Services payants (selon formule)</h3>
            <ul class="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Recherche sémantique :</strong> Recherche dans le Code Général des Impôts</li>
              <li><strong>Simulateurs fiscaux :</strong> Outils de calcul (IS, TVA, ITS, etc.)</li>
              <li><strong>Assistant IA :</strong> Réponses aux questions fiscales (quota selon formule)</li>
              <li><strong>Calendrier fiscal :</strong> Échéances personnalisées</li>
              <li><strong>Export :</strong> Téléchargement de documents PDF</li>
            </ul>
          </section>

          <!-- Article 5 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 5 - Utilisation</h2>

            <h3 class="font-medium text-gray-900 mb-2">5.1 Usage autorisé</h3>
            <p class="text-gray-700 mb-4">
              La plateforme est destinée à un usage personnel et/ou professionnel d'aide à la compréhension de la fiscalité congolaise.
            </p>

            <h3 class="font-medium text-gray-900 mb-2">5.2 Usages interdits</h3>
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-red-800 font-medium mb-2">Il est strictement interdit de :</p>
              <ul class="list-disc list-inside text-red-700 space-y-1 text-sm">
                <li>Reproduire ou extraire massivement le contenu</li>
                <li>Utiliser des robots, scripts ou outils automatisés</li>
                <li>Tenter de contourner les mesures de sécurité</li>
                <li>Usurper l'identité d'un tiers</li>
                <li>Partager ses identifiants ou revendre l'accès</li>
              </ul>
            </div>
          </section>

          <!-- Article 6 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 6 - Propriété intellectuelle</h2>

            <h3 class="font-medium text-gray-900 mb-2">6.1 Droits de l'Éditeur</h3>
            <p class="text-gray-700 mb-4">
              La plateforme CGI 242, son code source, design, logos et contenu sont la propriété exclusive
              d'ETS MG ADVISE. Marque NORMX AI (INPI n°5146181).
            </p>

            <h3 class="font-medium text-gray-900 mb-2">6.2 Licence d'utilisation</h3>
            <p class="text-gray-700">
              L'abonnement confère une licence personnelle, non exclusive et non transférable, limitée à la durée de l'abonnement.
            </p>
          </section>

          <!-- Article 7 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 7 - Responsabilité</h2>

            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 class="font-medium text-yellow-800 mb-2">Information importante</h3>
              <p class="text-yellow-700 text-sm">
                Les informations fournies par CGI 242 ont un caractère général et informatif.
                Elles ne constituent pas un conseil juridique ou fiscal personnalisé.
              </p>
            </div>

            <p class="text-gray-700 mb-2">
              <strong>Recommandation :</strong> Pour toute situation fiscale complexe, consultez un professionnel qualifié
              (expert-comptable, avocat fiscaliste).
            </p>

            <p class="text-gray-700">
              L'Utilisateur est seul responsable des décisions prises sur la base des informations obtenues via la plateforme.
            </p>
          </section>

          <!-- Article 8 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 8 - Sanctions</h2>
            <p class="text-gray-700 mb-2">En cas de violation des CGU, ETS MG ADVISE peut :</p>
            <ul class="list-disc list-inside text-gray-700 space-y-1">
              <li>Adresser un avertissement</li>
              <li>Suspendre temporairement l'accès</li>
              <li>Résilier définitivement le compte</li>
              <li>Engager des poursuites judiciaires</li>
            </ul>
          </section>

          <!-- Article 9 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 9 - Modification des CGU</h2>
            <p class="text-gray-700">
              Les modifications seront notifiées par email et applicables 15 jours après notification.
              La poursuite de l'utilisation vaut acceptation.
            </p>
          </section>

          <!-- Article 10 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 10 - Droit applicable</h2>
            <ul class="text-gray-700 space-y-2">
              <li><strong>Droit applicable :</strong> Droit de la République du Congo</li>
              <li><strong>Juridiction :</strong> Tribunaux de Pointe-Noire</li>
            </ul>
          </section>

          <!-- Article 11 -->
          <section class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Article 11 - Contact</h2>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-700"><strong>ETS MG ADVISE</strong></p>
              <p class="text-gray-700">Téléphone : +242 05 203 42 21 / +242 05 379 99 59</p>
              <p class="text-gray-700">Email : contact&#64;normx-ai.com</p>
              <p class="text-gray-700">Site : https://cgi242.normx-ai.com</p>
              <p class="text-gray-700 mt-2"><strong>RCCM :</strong> CG-PNR-01-2023-A10-01130</p>
            </div>
          </section>

          <!-- Footer -->
          <footer class="mt-12 pt-8 border-t border-gray-200">
            <p class="text-gray-700 text-center mb-4">
              En utilisant CGI 242, vous reconnaissez avoir lu, compris et accepté les présentes CGU.
            </p>
            <p class="text-center text-gray-500 text-sm">
              Voir aussi :
              <a routerLink="/cgv" class="text-blue-600 hover:underline">CGV</a> |
              <a routerLink="/confidentialite" class="text-blue-600 hover:underline">Politique de Confidentialité</a>
            </p>
            <p class="text-center text-gray-500 text-sm mt-4">
              © 2026 NORMX AI - Marque déposée INPI n°5146181 - Tous droits réservés
            </p>
          </footer>
        </article>
      </main>
    </div>
  `,
})
export class CguComponent {}
