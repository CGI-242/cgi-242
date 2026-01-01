import { Routes } from '@angular/router';

export const CODE_ROUTES: Routes = [
  {
    path: ':version',
    loadComponent: () =>
      import('./code-container/code-container.component').then(
        (m) => m.CodeContainerComponent
      ),
  },
  {
    path: '',
    redirectTo: '2025',
    pathMatch: 'full',
  },
];
