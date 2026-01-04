import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ChatWidgetComponent } from '@shared/components/chat-widget/chat-widget.component';

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
export class AppComponent {
  authService = inject(AuthService);
}
