import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { requireMember, requireAdmin } from '@core/guards/org-role.guard';

/**
 * SECURITE: Routes protegees par guards de role
 * - /organization/create : utilisateur authentifie
 * - /organization/members : minimum MEMBER pour voir, ADMIN pour gerer
 * - /organization/settings : minimum ADMIN pour modifier
 */
export const ORGANIZATION_ROUTES: Routes = [
  {
    path: 'create',
    loadComponent: () =>
      import('./org-create/org-create.component').then((m) => m.OrgCreateComponent),
    canActivate: [authGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./org-settings/org-settings.component').then((m) => m.OrgSettingsComponent),
    canActivate: [authGuard, requireMember],
    children: [
      {
        path: 'members',
        loadComponent: () =>
          import('./org-members/org-members.component').then((m) => m.OrgMembersComponent),
        // Lecture pour MEMBER, actions restreintes dans le composant
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./org-settings/org-settings.component').then((m) => m.OrgSettingsComponent),
        canActivate: [requireAdmin],
      },
      {
        path: '',
        redirectTo: 'members',
        pathMatch: 'full',
      },
    ],
  },
];
