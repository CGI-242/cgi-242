import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private router = inject(Router);

  private breadcrumbsSignal = signal<BreadcrumbItem[]>([]);
  readonly breadcrumbs = this.breadcrumbsSignal.asReadonly();

  // Route label mapping
  private routeLabels: Record<string, string> = {
    'dashboard': 'Dashboard',
    'chat': 'Chat IA',
    'code': 'Livre CGI',
    '2025': 'CGI 2025',
    '2026': 'CGI 2026',
    'simulateur': 'Simulateurs',
    'irpp': 'IRPP',
    'its': 'ITS',
    'is': 'IS',
    'patente': 'Patente',
    'acompte-is': 'Acompte IS',
    'solde-is': 'Solde IS',
    'profile': 'Profil',
    'settings': 'Paramètres',
    'security': 'Sécurité',
    'organization': 'Organisation',
    'members': 'Membres',
    'general': 'Général',
    'billing': 'Facturation',
    'subscription': 'Abonnement',
    'auth': 'Authentification',
    'login': 'Connexion',
    'register': 'Inscription',
    'forgot-password': 'Mot de passe oublié',
  };

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBreadcrumbs();
      });
  }

  private updateBreadcrumbs(): void {
    const root = this.router.routerState.snapshot.root;
    const breadcrumbs = this.buildBreadcrumbs(root);
    this.breadcrumbsSignal.set(breadcrumbs);
  }

  private buildBreadcrumbs(
    route: ActivatedRouteSnapshot,
    url = '',
    breadcrumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    const children = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL = child.url.map((segment) => segment.path).join('/');

      if (routeURL !== '') {
        url += `/${routeURL}`;

        // Get label from route data or use mapping
        const label = child.data['breadcrumb'] || this.getLabel(routeURL);

        if (label) {
          breadcrumbs.push({
            label,
            route: url,
          });
        }
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  private getLabel(path: string): string {
    // Handle paths with multiple segments
    const segments = path.split('/');
    const lastSegment = segments[segments.length - 1];

    return this.routeLabels[lastSegment] || this.formatLabel(lastSegment);
  }

  private formatLabel(path: string): string {
    // Convert kebab-case to Title Case
    return path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Manual override for dynamic breadcrumbs
  setBreadcrumbs(items: BreadcrumbItem[]): void {
    this.breadcrumbsSignal.set(items);
  }

  // Add a breadcrumb item
  addBreadcrumb(item: BreadcrumbItem): void {
    this.breadcrumbsSignal.update((crumbs) => [...crumbs, item]);
  }

  // Clear breadcrumbs
  clear(): void {
    this.breadcrumbsSignal.set([]);
  }
}
