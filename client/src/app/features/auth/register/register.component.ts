import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { PasswordStrengthComponent } from '@shared/components/password-strength/password-strength.component';

// Validateur personnalisé pour vérifier que les mots de passe correspondent
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PasswordStrengthComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  form = this.fb.nonNullable.group({
    firstName: [''],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    profession: [''],
    password: ['', [Validators.required, Validators.minLength(12), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)/)]],
    confirmPassword: ['', Validators.required],
    terms: [false, Validators.requiredTrue],
  }, { validators: passwordMatchValidator });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password, firstName, lastName, profession } = this.form.getRawValue();

    this.authService.register({ email, password, firstName, lastName, profession }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.toast.success({
            title: 'Compte créé',
            message: 'Bienvenue sur CGI 242 !'
          });
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set(res.error ?? "Erreur lors de l'inscription");
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set("Erreur lors de l'inscription");
      },
    });
  }
}
