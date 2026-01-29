import { Routes } from '@angular/router';

export const ALERTES_FISCALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./alertes-fiscales.component').then((m) => m.AlertesFiscalesComponent),
    title: 'Alertes Fiscales - CGI 242',
  },
];
