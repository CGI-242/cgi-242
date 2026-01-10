import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { MobileService } from '@core/services/mobile.service';
import { ChatWidgetComponent } from '@shared/components/chat-widget/chat-widget.component';
import { MobileTabsComponent } from '@shared/components/mobile-tabs/mobile-tabs.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ChatWidgetComponent, MobileTabsComponent],
  template: `
    <div class="app-container" [class.has-mobile-tabs]="showMobileTabs">
      <router-outlet />
      @if (authService.isAuthenticated()) {
        <app-chat-widget />
        <app-mobile-tabs />
      }
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
    }
    .app-container.has-mobile-tabs {
      padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px));
    }
    @media (min-width: 768px) {
      .app-container.has-mobile-tabs {
        padding-bottom: 0;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  mobileService = inject(MobileService);
  private router = inject(Router);

  showMobileTabs = false;

  ngOnInit(): void {
    // Détection du domaine pour afficher la bonne landing page
    const hostname = window.location.hostname;
    const path = window.location.pathname;

    // Si on est sur cgi242.normx-ai.com et à la racine, rediriger vers /accueil
    if (hostname === environment.appDomain && path === '/') {
      this.router.navigate(['/accueil']);
    }

    // Track route changes to show/hide mobile tabs
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navEvent = event as NavigationEnd;
      // Hide tabs on landing, auth, and maintenance pages
      const hiddenRoutes = ['/accueil', '/auth', '/maintenance', '/'];
      this.showMobileTabs = !hiddenRoutes.some(route =>
        navEvent.urlAfterRedirects === route || navEvent.urlAfterRedirects.startsWith('/auth')
      );
    });
  }
}
