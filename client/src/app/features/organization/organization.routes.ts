import { Routes } from '@angular/router';

export const ORGANIZATION_ROUTES: Routes = [
  {
    path: 'create',
    loadComponent: () =>
      import('./org-create/org-create.component').then((m) => m.OrgCreateComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./org-settings/org-settings.component').then((m) => m.OrgSettingsComponent),
    children: [
      {
        path: 'members',
        loadComponent: () =>
          import('./org-members/org-members.component').then((m) => m.OrgMembersComponent),
      },
      {
        path: '',
        redirectTo: 'members',
        pathMatch: 'full',
      },
    ],
  },
];
