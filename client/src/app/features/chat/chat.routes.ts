import { Routes } from '@angular/router';

export const CHAT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./chat-container/chat-container.component').then(
        (m) => m.ChatContainerComponent
      ),
  },
];
