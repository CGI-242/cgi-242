import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
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
    path: 'forbidden',
    loadComponent: () =>
      import('./features/landing/forbidden.component').then((m) => m.ForbiddenComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
