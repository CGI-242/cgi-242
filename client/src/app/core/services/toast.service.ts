import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
  dismissible: boolean;
}

export interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

const DEFAULT_DURATION = 5000;
const MAX_TOASTS = 5;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);

  toasts = this.toastsSignal.asReadonly();
  hasToasts = computed(() => this.toastsSignal().length > 0);

  /**
   * Afficher un toast de succès
   */
  success(options: ToastOptions | string): void {
    this.show('success', options);
  }

  /**
   * Afficher un toast d'erreur
   */
  error(options: ToastOptions | string): void {
    this.show('error', typeof options === 'string' ? { title: options, duration: 7000 } : { ...options, duration: options.duration ?? 7000 });
  }

  /**
   * Afficher un toast d'avertissement
   */
  warning(options: ToastOptions | string): void {
    this.show('warning', options);
  }

  /**
   * Afficher un toast d'information
   */
  info(options: ToastOptions | string): void {
    this.show('info', options);
  }

  /**
   * Afficher un toast
   */
  private show(type: ToastType, options: ToastOptions | string): void {
    const opts: ToastOptions = typeof options === 'string' ? { title: options } : options;

    const toast: Toast = {
      id: this.generateId(),
      type,
      title: opts.title,
      message: opts.message,
      duration: opts.duration ?? DEFAULT_DURATION,
      dismissible: opts.dismissible ?? true,
    };

    // Limiter le nombre de toasts affichés
    this.toastsSignal.update((toasts) => {
      const updated = [...toasts, toast];
      return updated.slice(-MAX_TOASTS);
    });

    // Auto-dismiss après la durée
    if (toast.duration > 0) {
      setTimeout(() => this.dismiss(toast.id), toast.duration);
    }
  }

  /**
   * Fermer un toast
   */
  dismiss(id: string): void {
    this.toastsSignal.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  /**
   * Fermer tous les toasts
   */
  dismissAll(): void {
    this.toastsSignal.set([]);
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
