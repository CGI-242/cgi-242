import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MobileService } from '@core/services/mobile.service';

interface TabItem {
  path: string;
  label: string;
  icon: string;
  activeIcon: string;
}

@Component({
  selector: 'app-mobile-tabs',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    @if (mobileService.isNative() || isSmallScreen) {
      <nav class="mobile-tabs">
        @for (tab of tabs; track tab.path) {
          <a
            [routerLink]="tab.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: tab.path === '/dashboard' }"
            class="tab-item"
            (click)="onTabClick()">
            <div class="tab-icon" [innerHTML]="getIcon(tab)"></div>
            <span class="tab-label">{{ tab.label }}</span>
          </a>
        }
      </nav>
    }
  `,
  styles: [`
    .mobile-tabs {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-around;
      align-items: center;
      background: white;
      border-top: 1px solid #e2e8f0;
      padding: 8px 0;
      padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
      z-index: 1000;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    }

    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4px 12px;
      text-decoration: none;
      color: #6B7280;
      transition: all 0.2s ease;
      min-width: 64px;
    }

    .tab-item.active {
      color: #0077B5;
    }

    .tab-item.active .tab-icon {
      transform: scale(1.1);
    }

    .tab-icon {
      width: 24px;
      height: 24px;
      margin-bottom: 2px;
      transition: transform 0.2s ease;
    }

    .tab-icon :deep(svg) {
      width: 100%;
      height: 100%;
    }

    .tab-label {
      font-size: 10px;
      font-weight: 500;
      line-height: 1.2;
    }

    @media (min-width: 768px) {
      .mobile-tabs {
        display: none;
      }
    }
  `]
})
export class MobileTabsComponent {
  mobileService = inject(MobileService);

  isSmallScreen = window.innerWidth < 768;

  tabs: TabItem[] = [
    {
      path: '/dashboard',
      label: 'Accueil',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
      activeIcon: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`
    },
    {
      path: '/code/2025',
      label: 'CGI',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
      activeIcon: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`
    },
    {
      path: '/chat',
      label: 'Chat IA',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`,
      activeIcon: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`
    },
    {
      path: '/simulators',
      label: 'Calculs',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`,
      activeIcon: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`
    },
    {
      path: '/profile',
      label: 'Profil',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
      activeIcon: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
    }
  ];

  constructor() {
    window.addEventListener('resize', () => {
      this.isSmallScreen = window.innerWidth < 768;
    });
  }

  getIcon(tab: TabItem): string {
    return tab.icon;
  }

  onTabClick(): void {
    this.mobileService.hapticImpact('light');
  }
}
