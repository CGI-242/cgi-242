import { Routes } from '@angular/router';

export const SIMULATEUR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./simulateur-container/simulateur-container.component').then(
        (m) => m.SimulateurContainerComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'irpp',
        pathMatch: 'full',
      },
      {
        path: 'irpp',
        loadComponent: () =>
          import('./irpp-calculator/irpp-calculator.component').then(
            (m) => m.IrppCalculatorComponent
          ),
        data: { title: 'IRPP - Impôt sur le Revenu des Personnes Physiques (CGI 2025)' },
      },
      {
        path: 'its',
        loadComponent: () =>
          import('./its-calculator/its-calculator.component').then(
            (m) => m.ItsCalculatorComponent
          ),
        data: { title: 'ITS - Impôt sur les Traitements et Salaires (CGI 2026)' },
      },
      {
        path: 'is',
        loadComponent: () =>
          import('./is-calculator/is-calculator.component').then(
            (m) => m.IsCalculatorComponent
          ),
        data: { title: 'IS - Impôt sur les Sociétés (CGI 2026)' },
      },
      {
        path: 'patente',
        loadComponent: () =>
          import('./patente-calculator/patente-calculator.component').then(
            (m) => m.PatenteCalculatorComponent
          ),
        data: { title: 'Patente - Contribution des Patentes (CGI 2025)' },
      },
      {
        path: 'acompte-is',
        loadComponent: () =>
          import('./coming-soon/coming-soon.component').then(
            (m) => m.ComingSoonComponent
          ),
        data: { title: 'Acompte IS' },
      },
      {
        path: 'solde-is',
        loadComponent: () =>
          import('./coming-soon/coming-soon.component').then(
            (m) => m.ComingSoonComponent
          ),
        data: { title: 'Solde IS' },
      },
    ],
  },
];
