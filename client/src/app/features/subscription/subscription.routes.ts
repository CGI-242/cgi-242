import { Routes } from '@angular/router';

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./subscription.component').then((m) => m.SubscriptionComponent),
  },
  {
    path: 'checkout/:planId',
    loadComponent: () =>
      import('./checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'confirmation',
    loadComponent: () =>
      import('./confirmation.component').then((m) => m.ConfirmationComponent),
  },
];
