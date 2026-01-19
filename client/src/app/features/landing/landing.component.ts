import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface Product {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  status: 'available' | 'coming-soon';
  url: string;
  features: string[];
  gradient: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  currentYear = new Date().getFullYear();
  cgi242Url = environment.production ? `https://${environment.appDomain}` : '/accueil';
  paie242Url = environment.production ? `https://${environment.paieDomain}` : 'http://localhost:4201';

  stats = [
    { value: '4+', label: 'Produits' },
    { value: '5+', label: 'Pays cibles' },
    { value: '24/7', label: 'Disponibilité' }
  ];

  products: Product[] = [
    { id: 'cgi242', name: 'CGI 242', description: 'Assistant fiscal IA pour le Congo-Brazzaville.', icon: 'scales', image: 'assets/images/products/cgi242.webp', status: 'available', url: this.cgi242Url, features: ['2000+ articles', 'Recherche IA', 'CGI 2026'], gradient: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { id: 'paie242', name: 'Paie 242', description: 'Solution de paie conforme à la législation congolaise.', icon: 'money', image: 'assets/images/products/paie-242.webp', status: 'coming-soon', url: this.paie242Url, features: ['CNSS intégré', 'Bulletins auto', 'Déclarations'], gradient: 'bg-gradient-to-br from-green-500 to-green-600' },
    { id: 'ohada17', name: 'Ohada 17', description: 'Comptabilité SYSCOHADA pour les 17 pays membres.', icon: 'chart-pie', image: 'assets/images/products/ohada-17.webp', status: 'coming-soon', url: '#', features: ['Plan OHADA', 'Contrôles IA', 'États financiers'], gradient: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    { id: 'labodec', name: 'Labo Dec', description: 'Laboratoire comptable pour la préparation aux examens.', icon: 'flask', image: 'assets/images/products/labo-dec.webp', status: 'coming-soon', url: '#', features: ['Plan comptable français', 'Écritures comptables', 'Cas pratiques'], gradient: 'bg-gradient-to-br from-purple-500 to-purple-600' }
  ];

  values = [
    { icon: 'shield-check', title: 'Confiance', description: 'Solutions fiables' },
    { icon: 'lightning', title: 'Innovation', description: 'Technologies IA' },
    { icon: 'hand-coins', title: 'Accessibilité', description: 'Prix adaptés' },
    { icon: 'graduation-cap', title: 'Expertise', description: 'Connaissance locale' }
  ];

  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  formSubmitted = false;

  submitForm(): void {
    console.log('Contact form submitted:', this.contactForm);
    this.formSubmitted = true;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/products/placeholder.webp';
    }
  }
}
