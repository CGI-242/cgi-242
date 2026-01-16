import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

@Component({
  selector: 'app-password-strength',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="password-strength">
      <!-- Barre de force -->
      <div class="flex gap-1 mb-2">
        @for (i of [0, 1, 2, 3]; track i) {
          <div
            class="h-1.5 flex-1 rounded-full transition-colors duration-300"
            [class.bg-gray-200]="i >= strength().score"
            [style.backgroundColor]="i < strength().score ? strength().color : ''">
          </div>
        }
      </div>

      <!-- Label de force -->
      <div class="flex items-center justify-between text-xs">
        <span [style.color]="strength().color" class="font-medium">
          {{ strength().label }}
        </span>
        <span class="text-gray-400">
          {{ strength().score }}/4
        </span>
      </div>

      <!-- Critères détaillés -->
      @if (showDetails()) {
        <div class="mt-3 space-y-1.5">
          <div class="flex items-center gap-2 text-xs" [class.text-green-600]="strength().checks.length" [class.text-gray-400]="!strength().checks.length">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              @if (strength().checks.length) {
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              } @else {
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              }
            </svg>
            <span>Au moins 12 caractères</span>
          </div>

          <div class="flex items-center gap-2 text-xs" [class.text-green-600]="strength().checks.uppercase" [class.text-gray-400]="!strength().checks.uppercase">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              @if (strength().checks.uppercase) {
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              } @else {
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              }
            </svg>
            <span>Une lettre majuscule</span>
          </div>

          <div class="flex items-center gap-2 text-xs" [class.text-green-600]="strength().checks.lowercase" [class.text-gray-400]="!strength().checks.lowercase">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              @if (strength().checks.lowercase) {
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              } @else {
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              }
            </svg>
            <span>Une lettre minuscule</span>
          </div>

          <div class="flex items-center gap-2 text-xs" [class.text-green-600]="strength().checks.number" [class.text-gray-400]="!strength().checks.number">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              @if (strength().checks.number) {
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              } @else {
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              }
            </svg>
            <span>Un chiffre</span>
          </div>

          <div class="flex items-center gap-2 text-xs" [class.text-green-600]="strength().checks.special" [class.text-gray-400]="!strength().checks.special">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              @if (strength().checks.special) {
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              } @else {
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              }
            </svg>
            <span>Un caractère spécial (!&#64;#$%...)</span>
          </div>
        </div>
      }
    </div>
  `,
})
export class PasswordStrengthComponent {
  password = input('');
  showDetails = input(true);

  strength = computed<PasswordStrength>(() => {
    const pwd = this.password();

    const checks = {
      length: pwd.length >= 12,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    // Cap score at 4 (max level)
    const score = Math.min(Object.values(checks).filter(Boolean).length, 4);

    const levels: Record<number, { label: string; color: string }> = {
      0: { label: 'Très faible', color: '#ef4444' },
      1: { label: 'Faible', color: '#f97316' },
      2: { label: 'Moyen', color: '#eab308' },
      3: { label: 'Fort', color: '#22c55e' },
      4: { label: 'Très fort', color: '#16a34a' },
    };

    return {
      score,
      ...levels[score] || levels[0],
      checks,
    };
  });
}
