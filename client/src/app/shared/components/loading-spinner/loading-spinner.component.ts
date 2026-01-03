import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [class]="containerClass">
      <div
        class="animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"
        [ngClass]="{
          'w-4 h-4': size === 'sm',
          'w-6 h-6': size === 'md',
          'w-8 h-8': size === 'lg',
          'w-12 h-12': size === 'xl'
        }">
      </div>
      @if (text) {
        <span class="ml-3 text-secondary-600" [class.text-sm]="size === 'sm'">{{ text }}</span>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() text = '';
  @Input() containerClass = '';
}
