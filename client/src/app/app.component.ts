import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ChatWidgetComponent } from '@shared/components/chat-widget/chat-widget.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ChatWidgetComponent],
  template: `
    <router-outlet />
    @if (authService.isAuthenticated()) {
      <app-chat-widget />
    }
  `,
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // Détection du domaine pour afficher la bonne landing page
    const hostname = window.location.hostname;
    const path = window.location.pathname;

    // Si on est sur cgi242.normx-ai.com et à la racine, rediriger vers /accueil
    if (hostname === environment.appDomain && path === '/') {
      this.router.navigate(['/accueil']);
    }
  }
}
