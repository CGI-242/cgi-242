import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth routes
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  // CGI 242 routes (app principale)
  {
    path: 'chat',
    loadChildren: () =>
      import('./features/chat/chat.routes').then((m) => m.CHAT_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'organization',
    loadChildren: () =>
      import('./features/organization/organization.routes').then((m) => m.ORGANIZATION_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'code',
    loadChildren: () =>
      import('./features/code/code.routes').then((m) => m.CODE_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'simulateur',
    loadChildren: () =>
      import('./features/simulateur/simulateur.routes').then((m) => m.SIMULATEUR_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'subscription',
    loadChildren: () =>
      import('./features/subscription/subscription.routes').then((m) => m.SUBSCRIPTION_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./features/analytics/analytics-dashboard.component').then((m) => m.AnalyticsDashboardComponent),
    canActivate: [authGuard],
  },
  // Pages spéciales
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./features/landing/forbidden.component').then((m) => m.ForbiddenComponent),
  },
  // Maintenance pages pour les autres produits NORMX AI
  {
    path: 'tauly',
    loadComponent: () =>
      import('./features/landing/external-redirect.component').then((m) => m.ExternalRedirectComponent),
    data: { externalUrl: 'https://tauly-africa.com' }
  },
  {
    path: 'paie-congo',
    loadComponent: () =>
      import('./features/landing/maintenance.component').then((m) => m.MaintenanceComponent),
    data: {
      productName: 'Paie Congo',
      progress: 25,
      features: ['Bulletins de paie automatisés', 'Déclarations CNSS', 'Gestion des congés', 'Export comptable']
    }
  },
  {
    path: 'ohada-compta',
    loadComponent: () =>
      import('./features/landing/maintenance.component').then((m) => m.MaintenanceComponent),
    data: {
      productName: 'OHADA Compta',
      progress: 20,
      features: ['Plan comptable SYSCOHADA', 'Contrôles automatisés par IA', 'États financiers', 'Liasse fiscale']
    }
  },
  // Landing page CGI 242 (pour cgi242.normx-ai.com)
  {
    path: 'accueil',
    loadComponent: () =>
      import('./features/landing/cgi242-landing.component').then((m) => m.Cgi242LandingComponent),
  },
  // Pages légales
  {
    path: 'cgv',
    loadComponent: () =>
      import('./features/landing/cgv.component').then((m) => m.CgvComponent),
  },
  {
    path: 'cgu',
    loadComponent: () =>
      import('./features/landing/cgu.component').then((m) => m.CguComponent),
  },
  {
    path: 'confidentialite',
    loadComponent: () =>
      import('./features/landing/confidentialite.component').then((m) => m.ConfidentialiteComponent),
  },
  {
    path: 'mentions-legales',
    loadComponent: () =>
      import('./features/landing/mentions-legales.component').then((m) => m.MentionsLegalesComponent),
  },
  // Landing page NORMX AI (page d'accueil pour normx-ai.com)
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  // Redirect pour routes inconnues
  {
    path: '**',
    redirectTo: '',
  },
];
