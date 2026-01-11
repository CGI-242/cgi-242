import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./profile-container.component').then((m) => m.ProfileContainerComponent),
    children: [
      {
        path: 'info',
        loadComponent: () =>
          import('./profile-info.component').then((m) => m.ProfileInfoComponent),
      },
      {
        path: 'security',
        loadComponent: () =>
          import('./profile-security.component').then((m) => m.ProfileSecurityComponent),
      },
      {
        path: 'settings',
        redirectTo: 'security',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: 'info',
        pathMatch: 'full',
      },
    ],
  },
];
