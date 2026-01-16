import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  launchPrice: number;
  priceHT: number;
  tva: number;
  period: string;
  questionsPerMonth: number;
  maxMembers: number;
  features: string[];
}

// Grille tarifaire officielle CGI 242 - Janvier 2026
const PLANS: Record<string, PlanDetails> = {
  FREE: {
    id: 'FREE',
    name: 'STANDARD',
    price: 60000,
    launchPrice: 50000,
    priceHT: 42373,
    tva: 7627,
    period: 'an',
    questionsPerMonth: 0,
    maxMembers: 1,
    features: [
      'Recherche CGI illimitee',
      'Tous les simulateurs fiscaux',
      'Calendrier fiscal + alertes',
      '5 exports PDF/mois',
      'Support email (72h)',
    ],
  },
  STARTER: {
    id: 'STARTER',
    name: 'PRO',
    price: 90000,
    launchPrice: 75000,
    priceHT: 63559,
    tva: 11441,
    period: 'an',
    questionsPerMonth: 50,
    maxMembers: 1,
    features: [
      'Tout STANDARD inclus',
      '50 questions IA/mois',
      '20 exports PDF/mois',
      'Veille fiscale',
      'Support email (48h)',
    ],
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'EXPERT',
    price: 120000,
    launchPrice: 100000,
    priceHT: 84746,
    tva: 15254,
    period: 'an',
    questionsPerMonth: 100,
    maxMembers: 1,
    features: [
      'Tout PRO inclus',
      '100 questions IA/mois',
      'Exports PDF illimites',
      'Support prioritaire (24h)',
    ],
  },
};

@Component({
  selector: 'app-checkout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private auth = inject(AuthService);

  plan = signal<PlanDetails | null>(null);
  loading = signal(false);
  submitted = signal(false);
  errorMessage = signal('');
  showValidationError = signal(false);

  acceptCGV = false;
  acceptPrivacy = false;
  acceptRetractation = false;

  ngOnInit(): void {
    const planId = this.route.snapshot.paramMap.get('planId');
    if (planId && PLANS[planId]) {
      this.plan.set(PLANS[planId]);
    }
  }

  getLaunchPriceHT(): number {
    const p = this.plan();
    if (!p) return 0;
    return Math.round(p.launchPrice / 1.18);
  }

  getLaunchTVA(): number {
    const p = this.plan();
    if (!p) return 0;
    return p.launchPrice - this.getLaunchPriceHT();
  }

  isFormValid(): boolean {
    return this.acceptCGV && this.acceptPrivacy && this.acceptRetractation;
  }

  proceedToPayment(): void {
    if (this.submitted() || this.loading()) {
      return;
    }

    if (!this.isFormValid()) {
      this.showValidationError.set(true);
      return;
    }

    this.showValidationError.set(false);
    this.submitted.set(true);
    this.loading.set(true);
    this.errorMessage.set('');

    const planData = this.plan();
    if (!planData) return;

    this.api.post<{ paymentUrl: string; transactionId: string }>('/payments/create', {
      planId: planData.id,
      amount: planData.launchPrice, // Use launch price
      acceptedCGV: this.acceptCGV,
      acceptedPrivacy: this.acceptPrivacy,
      acceptedRetractation: this.acceptRetractation,
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data?.paymentUrl) {
          window.location.href = res.data.paymentUrl;
        } else {
          this.router.navigate(['/subscription/confirmation'], {
            queryParams: {
              plan: planData.id,
              amount: planData.launchPrice,
              status: 'success',
            },
          });
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.submitted.set(false);
        this.errorMessage.set(err.error?.message || 'Une erreur est survenue. Veuillez reessayer.');
      },
    });
  }
}
