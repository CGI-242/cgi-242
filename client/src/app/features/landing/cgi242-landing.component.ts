import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AudioButtonComponent } from '@shared/components/audio-button/audio-button.component';

@Component({
  selector: 'app-cgi242-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AudioButtonComponent],
  templateUrl: './cgi242-landing.component.html',
  styleUrls: ['./cgi242-landing.component.scss']
})
export class Cgi242LandingComponent implements OnInit {
  currentYear = new Date().getFullYear();
  mobileMenuOpen = signal(false);
  scrolled = signal(false);
  formSubmitted = signal(false);
  normxUrl = environment.production ? `https://${environment.landingDomain}` : '/';

  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  submitContactForm(): void {
    console.log('Contact form submitted:', this.contactForm);
    this.formSubmitted.set(true);
  }

  features = [
    {
      icon: 'ph-magnifying-glass',
      title: 'Recherche semantique',
      description: 'Trouvez instantanement les articles pertinents grace a notre moteur de recherche intelligent.',
      badge: null
    },
    {
      icon: 'ph-chat-centered-text',
      title: 'Chat IA Fiscal',
      description: 'Posez vos questions en langage naturel et obtenez des reponses precises avec references aux articles.',
      badge: 'PRO & EXPERT'
    },
    {
      icon: 'ph-book-open',
      title: 'Navigateur CGI',
      description: 'Parcourez l\'integralite du Code General des Impots 2026 avec une navigation intuitive.',
      badge: null
    },
    {
      icon: 'ph-calculator',
      title: 'Simulateurs d\'impots',
      description: 'IS, IRPP, ITS, TVA, Patente, Taxe fonciere, Droits d\'enregistrement. Resultats instantanes.',
      badge: null
    },
    {
      icon: 'ph-calendar',
      title: 'Calendrier fiscal',
      description: 'Toutes les echeances legales avec rappels automatiques. Export iCal et Google Calendar.',
      badge: null
    },
    {
      icon: 'ph-bell',
      title: 'Veille fiscale',
      description: 'Alertes sur les nouvelles lois, circulaires DGID et notes de service.',
      badge: 'PRO & EXPERT'
    }
  ];

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.scrolled.set(window.scrollY > 50);
      });
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
