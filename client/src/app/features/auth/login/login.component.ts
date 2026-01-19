import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { AuditService } from '@core/services/audit.service';

const MAX_FAILED_ATTEMPTS = 3;
const BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private auditService = inject(AuditService);

  readonly MAX_FAILED_ATTEMPTS = MAX_FAILED_ATTEMPTS;

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  failedAttempts = signal(0);
  blockEndTime = signal<Date | null>(null);
  captchaError = signal(false);

  // Email verification
  isEmailNotVerified = signal(false);
  isResendingEmail = signal(false);
  resendSuccess = signal(false);
  private lastEmail = '';

  // CAPTCHA simple: addition de deux nombres
  private captchaA = signal(Math.floor(Math.random() * 10) + 1);
  private captchaB = signal(Math.floor(Math.random() * 10) + 1);

  showCaptcha = computed(() => this.failedAttempts() >= MAX_FAILED_ATTEMPTS);
  captchaQuestion = computed(() => `${this.captchaA()} + ${this.captchaB()} = ?`);
  captchaAnswer = computed(() => this.captchaA() + this.captchaB());

  isBlocked = computed(() => {
    const endTime = this.blockEndTime();
    if (!endTime) return false;
    return new Date() < endTime;
  });

  remainingBlockTime = computed(() => {
    const endTime = this.blockEndTime();
    if (!endTime) return '';
    const remaining = Math.max(0, endTime.getTime() - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  isCaptchaValid = computed(() => {
    const captchaValue = this.form.get('captcha')?.value;
    return captchaValue === this.captchaAnswer();
  });

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    captcha: [null as number | null],
  });

  private regenerateCaptcha(): void {
    this.captchaA.set(Math.floor(Math.random() * 10) + 1);
    this.captchaB.set(Math.floor(Math.random() * 10) + 1);
    this.form.patchValue({ captcha: null });
    this.captchaError.set(false);
  }

  private handleFailedAttempt(): void {
    const attempts = this.failedAttempts() + 1;
    this.failedAttempts.set(attempts);

    // AUDIT: Log de la tentative echouee pour detection brute force
    const email = this.form.get('email')?.value ?? '';
    this.auditService.logFailedLogin(email);

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      // Activer le blocage temporaire
      this.blockEndTime.set(new Date(Date.now() + BLOCK_DURATION_MS));
      this.regenerateCaptcha();

      // Lancer un timer pour mettre a jour l'affichage
      const interval = setInterval(() => {
        if (!this.isBlocked()) {
          clearInterval(interval);
          this.blockEndTime.set(null);
        }
      }, 1000);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isBlocked()) return;

    // Verifier le CAPTCHA si requis
    if (this.showCaptcha() && !this.isCaptchaValid()) {
      this.captchaError.set(true);
      this.regenerateCaptcha();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.captchaError.set(false);

    const { email, password } = this.form.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          // Reinitialiser les tentatives en cas de succes
          this.failedAttempts.set(0);
          this.blockEndTime.set(null);
          this.toast.success('Connexion réussie');
          this.router.navigate(['/dashboard']);
        } else {
          this.handleFailedAttempt();
          this.errorMessage.set(res.error ?? 'Erreur de connexion');
          this.regenerateCaptcha();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.handleFailedAttempt();
        // Afficher le message d'erreur du backend si disponible
        const backendMessage = err?.error?.error || err?.error?.message;
        this.errorMessage.set(backendMessage || 'Email ou mot de passe incorrect');

        // Détecter si c'est une erreur de validation d'email
        if (backendMessage?.toLowerCase().includes('valider votre email') ||
            backendMessage?.toLowerCase().includes('vérifier votre email')) {
          this.isEmailNotVerified.set(true);
          this.lastEmail = this.form.get('email')?.value ?? '';
        } else {
          this.isEmailNotVerified.set(false);
        }

        this.regenerateCaptcha();
      },
    });
  }

  resendVerificationEmail(): void {
    if (!this.lastEmail || this.isResendingEmail()) return;

    this.isResendingEmail.set(true);
    this.resendSuccess.set(false);

    this.authService.resendVerificationEmail(this.lastEmail).subscribe({
      next: () => {
        this.isResendingEmail.set(false);
        this.resendSuccess.set(true);
        this.toast.success('Email de vérification envoyé !');
      },
      error: (err) => {
        this.isResendingEmail.set(false);
        const errorMsg = err?.error?.error || 'Erreur lors de l\'envoi';
        this.toast.error(errorMsg);
      },
    });
  }
}
