# CHARTE GRAPHIQUE NORMX AI

**Guide d'identité visuelle officiel**

Version 1.0 - Janvier 2026

---

## 1. Présentation de la marque

### Notre identité

**NORMX AI** est une marque française déposée à l'INPI (n°5146181), spécialisée dans le développement de solutions logicielles innovantes basées sur l'intelligence artificielle, destinées principalement au marché africain francophone.

### Nos valeurs

| Valeur | Description |
|--------|-------------|
| **Confiance** | Solutions fiables et sécurisées pour les professionnels |
| **Innovation** | Technologies IA de pointe adaptées aux besoins locaux |
| **Accessibilité** | Prix adaptés au marché africain, interfaces intuitives |
| **Expertise** | Connaissance approfondie de la fiscalité et comptabilité OHADA/CEMAC |

### Nos produits

| Produit | Description |
|---------|-------------|
| **CGI 242** | Assistant fiscal intelligent pour le Code Général des Impôts du Congo |
| **TAULY** | Plateforme de gestion RH et staffing avec matching IA |
| **Paie Congo** | Solution de paie conforme à la législation congolaise |
| **OHADA Compta** | Comptabilité SYSCOHADA avec contrôles automatisés |

---

## 2. Palette de couleurs

La palette NORMX AI est construite autour de trois piliers : le **bleu institutionnel** (confiance), le **gris technique** (modernité) et le **blanc** (clarté).

### Bleu institutionnel (couleur maître)

*Pilier de confiance et crédibilité*

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| **Primary Blue** | `#0077B5` | rgb(0, 119, 181) | Logo, header, boutons primaires, éléments clés |
| **Dark Blue** | `#005A8C` | rgb(0, 90, 140) | Hover, documents officiels, fonds solennels |

### Gris technique (technologie & neutralité)

*IA maîtrisée, lisibilité, modernité*

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| **Anthracite** | `#1E1E1E` | rgb(30, 30, 30) | Titres, textes forts, pictogrammes |
| **Gray Tech** | `#6B7280` | rgb(107, 114, 128) | Labels, descriptions, textes secondaires |
| **Gray Light** | `#E5E7EB` | rgb(229, 231, 235) | Fonds de sections, tableaux, dashboards |

### Blanc (respiration & clarté)

*Lisibilité et équilibre*

| Nom | Hex | RGB | Usage |
|-----|-----|-----|-------|
| **Blanc pur** | `#FFFFFF` | rgb(255, 255, 255) | Fond principal, textes inversés sur fond sombre |
| **Blanc cassé** | `#F5F7FA` | rgb(245, 247, 250) | Arrière-plans doux, cartes, blocs UI |

---

## 3. Typographie

### Polices principales

| Police | Usage | Classe Tailwind |
|--------|-------|-----------------|
| **Poppins** | Titres (H1, H2, H3) | `font-heading` |
| **Inter** | Texte courant, corps, labels | `font-sans` (défaut) |

Téléchargement :
- Poppins : [fonts.google.com/specimen/Poppins](https://fonts.google.com/specimen/Poppins)
- Inter : [fonts.google.com/specimen/Inter](https://fonts.google.com/specimen/Inter)

### Police alternative : Arial

**Arial** est utilisée comme fallback lorsque Inter/Poppins ne sont pas disponibles (emails, documents Word, systèmes legacy).

### Configuration Tailwind

```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  heading: ['Poppins', 'Inter', 'sans-serif'],
}
```

### Utilisation dans le code

```html
<!-- Titre avec Poppins -->
<h1 class="font-heading text-4xl font-bold">Titre principal</h1>

<!-- Texte avec Inter (par défaut) -->
<p class="font-sans">Texte courant</p>
<p>Texte courant (Inter par défaut)</p>
```

### Hiérarchie typographique

| Élément | Police | Taille | Graisse | Couleur |
|---------|--------|--------|---------|---------|
| **H1 - Titre principal** | Poppins | 32-40px | Bold (700) | `#0077B5` |
| **H2 - Titre section** | Poppins | 24-28px | SemiBold (600) | `#0077B5` |
| **H3 - Sous-titre** | Poppins | 18-20px | SemiBold (600) | `#1E1E1E` |
| **Corps de texte** | Inter | 14-16px | Regular (400) | `#1E1E1E` |
| **Labels / Légendes** | Inter | 12-14px | Regular (400) | `#6B7280` |
| **Bouton primaire** | Inter | 14-16px | SemiBold (600) | `#FFFFFF` sur `#0077B5` |

---

## 4. Logo et utilisation

### Logo principal

Le logo NORMX AI est composé de deux éléments typographiques :

```
NORMX AI
└────┘└┘
  │    │
  │    └── Gray Tech #6B7280
  └─────── Primary Blue #0077B5
```

### Versions du logo

| Version | Usage | Fond |
|---------|-------|------|
| **Couleur** | Usage standard | Fond clair |
| **Inversé** | Fond sombre | `#0077B5` ou sombre |
| **Monochrome** | Impression N&B | Tous |

### Zone de protection

Une zone de protection équivalente à la hauteur du "X" de NORMX doit être respectée autour du logo. Aucun élément graphique ou textuel ne doit empiéter sur cette zone.

```
    ┌─────────────────────────┐
    │                         │
    │    ┌───────────────┐    │
    │    │   NORMX AI    │    │
    │    └───────────────┘    │
    │                         │
    └─────────────────────────┘
         Zone de protection
```

### Taille minimale

| Support | Largeur minimale |
|---------|------------------|
| **Print** | 25mm |
| **Digital** | 120px |

---

## 5. Applications

### Interface utilisateur (UI)

| Élément | Spécifications |
|---------|----------------|
| **Header / Navbar** | Fond `#0077B5`, texte `#FFFFFF` |
| **Sidebar** | Fond `#F5F7FA`, texte `#1E1E1E`, actif `#0077B5` |
| **Bouton primaire** | Fond `#0077B5`, texte `#FFFFFF`, hover `#005A8C` |
| **Bouton secondaire** | Bordure `#0077B5`, texte `#0077B5`, fond transparent |
| **Cartes / Cards** | Fond `#FFFFFF`, bordure `#E5E7EB`, ombre légère |
| **Tableaux** | Header `#0077B5`/`#FFFFFF`, lignes alternées `#F5F7FA` |
| **Liens** | Texte `#0077B5`, hover `#005A8C`, underline |
| **Alertes succès** | Fond `#D1FAE5`, bordure `#10B981` |
| **Alertes erreur** | Fond `#FEE2E2`, bordure `#EF4444` |
| **Alertes warning** | Fond `#FEF3C7`, bordure `#F59E0B` |

### CSS Variables

```css
:root {
  /* Couleurs principales */
  --primary-blue: #0077B5;
  --dark-blue: #005A8C;

  /* Gris */
  --anthracite: #1E1E1E;
  --gray-tech: #6B7280;
  --gray-light: #E5E7EB;

  /* Blancs */
  --white: #FFFFFF;
  --off-white: #F5F7FA;

  /* Typographie */
  --font-heading: 'Poppins', 'Inter', sans-serif;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.5;

  /* Espacements */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Bordures */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;

  /* Ombres */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'normx': {
          'primary': '#0077B5',
          'dark': '#005A8C',
          'anthracite': '#1E1E1E',
          'gray': '#6B7280',
          'light': '#E5E7EB',
          'off-white': '#F5F7FA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
      }
    }
  }
}
```

### Exemples de classes Tailwind

```html
<!-- Titre avec Poppins -->
<h1 class="font-heading text-4xl font-bold text-normx-primary">
  Titre principal
</h1>

<h2 class="font-heading text-2xl font-semibold text-normx-primary">
  Titre de section
</h2>

<!-- Bouton primaire -->
<button class="bg-normx-primary hover:bg-normx-dark text-white font-semibold py-2 px-4 rounded-md">
  Action
</button>

<!-- Bouton secondaire -->
<button class="border-2 border-normx-primary text-normx-primary hover:bg-normx-primary hover:text-white font-semibold py-2 px-4 rounded-md">
  Action secondaire
</button>

<!-- Card -->
<div class="bg-white border border-normx-light rounded-lg shadow-md p-6">
  <h3 class="font-heading text-normx-primary font-bold text-xl">Titre</h3>
  <p class="text-normx-anthracite">Contenu en Inter (par défaut)</p>
</div>

<!-- Header -->
<header class="bg-normx-primary text-white py-4 px-6">
  <span class="font-heading font-bold">NORMX</span> <span class="text-gray-200">AI</span>
</header>
```

---

## 6. Règles d'usage

### A faire

- Utiliser les couleurs exactes de la palette officielle
- Respecter la zone de protection autour du logo
- Utiliser Inter ou Arial comme police
- Maintenir un contraste suffisant pour la lisibilité
- Utiliser la version inversée du logo sur fond sombre
- Conserver les proportions du logo
- Utiliser des coins arrondis (4-12px) pour les éléments UI

### A éviter

- Modifier les couleurs du logo
- Déformer ou étirer le logo
- Ajouter des effets (ombre portée, dégradé, 3D)
- Utiliser le logo sur un fond qui nuit à sa lisibilité
- Changer la typographie du logo
- Utiliser le logo en dessous de la taille minimale
- Mélanger des polices non autorisées

---

## 7. Fichiers et ressources

### Structure des fichiers logo

```
/assets
├── /logo
│   ├── normx-ai-logo-color.svg
│   ├── normx-ai-logo-color.png
│   ├── normx-ai-logo-white.svg
│   ├── normx-ai-logo-white.png
│   ├── normx-ai-logo-mono.svg
│   └── normx-ai-logo-mono.png
├── /icons
│   ├── favicon.ico
│   ├── icon-192.png
│   └── icon-512.png
└── /fonts
    └── Inter (télécharger depuis Google Fonts)
```

### Formats recommandés

| Usage | Format |
|-------|--------|
| **Web** | SVG (préféré), PNG |
| **Print** | SVG, PDF, EPS |
| **Favicon** | ICO, PNG |
| **Réseaux sociaux** | PNG (1200x630 pour OG) |

---

## 8. Mentions légales

**NORMX AI** est une marque déposée à l'Institut National de la Propriété Industrielle (INPI) sous le numéro **5146181**.

Toute utilisation non autorisée de la marque, du logo ou des éléments visuels est strictement interdite.

---

## Contact

**NORMX AI**

- Web : www.normx-ai.com
- Email : contact@normx-ai.com

---

*Document créé par NORMX AI - Janvier 2026*

*© 2026 NORMX AI - Tous droits réservés*
