/**
 * Swagger/OpenAPI Configuration
 * Documentation API pour CGI-ENGINE
 */

import { config } from './environment.js';

export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'CGI-ENGINE API',
    description: `
## API REST pour la plateforme d'intelligence fiscale CGI-ENGINE

CGI-ENGINE est une application SaaS multi-tenant alimentée par l'IA,
dédiée au Code Général des Impôts du Congo-Brazzaville.

### Fonctionnalités principales:
- **Authentification** - JWT avec refresh tokens
- **Chat IA** - Consultations fiscales avec Claude Haiku
- **Simulateurs** - Calculs IRPP, ITS, IS conformes au CGI 2026
- **Multi-tenant** - Gestion organisations et quotas

### Authentification
L'API utilise des JWT Bearer tokens. Incluez le header:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

### Rate Limiting
- Global: 100 requêtes/minute
- Auth: 5 tentatives/15 minutes
- Chat: Selon le plan d'abonnement
    `,
    version: '1.0.0',
    contact: {
      name: 'CGI-ENGINE Support',
      email: 'support@cgi-engine.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: config.isDevelopment ? 'http://localhost:3000' : 'https://api.cgi-engine.com',
      description: config.isDevelopment ? 'Serveur de développement' : 'Serveur de production',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentification et gestion des sessions' },
    { name: 'Chat', description: 'Consultations fiscales IA' },
    { name: 'Fiscal', description: 'Simulateurs fiscaux (IRPP, ITS, IS)' },
    { name: 'Organizations', description: 'Gestion des organisations multi-tenant' },
    { name: 'Subscriptions', description: 'Gestion des abonnements' },
    { name: 'Health', description: 'Endpoints de monitoring' },
  ],
  paths: {
    // ========== AUTH ==========
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Inscription utilisateur',
        description: 'Crée un nouveau compte utilisateur',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
              example: {
                email: 'user@example.com',
                password: 'Password123!',
                name: 'John Doe',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Utilisateur créé avec succès',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          409: { description: 'Email déjà utilisé' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Connexion utilisateur',
        description: 'Authentifie un utilisateur et retourne les tokens JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              example: {
                email: 'user@example.com',
                password: 'Password123!',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Connexion réussie',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
            headers: {
              'Set-Cookie': {
                description: 'Refresh token en cookie HttpOnly',
                schema: { type: 'string' },
              },
            },
          },
          401: { description: 'Identifiants invalides' },
          429: { description: 'Trop de tentatives' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Déconnexion',
        description: 'Invalide les tokens de session',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Déconnexion réussie' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Rafraîchir le token',
        description: 'Génère un nouveau access token à partir du refresh token',
        responses: {
          200: {
            description: 'Token rafraîchi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    expiresIn: { type: 'number' },
                  },
                },
              },
            },
          },
          401: { description: 'Refresh token invalide ou expiré' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Profil utilisateur',
        description: 'Retourne les informations de l\'utilisateur connecté',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Profil utilisateur',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Mot de passe oublié',
        description: 'Envoie un email de réinitialisation (retourne toujours 200 pour la sécurité)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Email envoyé si le compte existe' },
        },
      },
    },
    '/api/auth/csrf-token': {
      get: {
        tags: ['Auth'],
        summary: 'Obtenir un token CSRF',
        description: 'Génère un token CSRF pour les mutations',
        responses: {
          200: {
            description: 'Token CSRF',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    csrfToken: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ========== CHAT ==========
    '/api/chat/message': {
      post: {
        tags: ['Chat'],
        summary: 'Envoyer un message',
        description: 'Envoie un message au chatbot fiscal IA',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChatMessageRequest' },
              example: {
                message: 'Quel est le taux de l\'IRPP pour un revenu de 500000 FCFA ?',
                conversationId: null,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Réponse du chatbot',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChatMessageResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { description: 'Quota mensuel dépassé' },
        },
      },
    },
    '/api/chat/message/stream': {
      post: {
        tags: ['Chat'],
        summary: 'Envoyer un message (Streaming SSE)',
        description: `Envoie un message avec réponse en streaming via Server-Sent Events.

**Format SSE:**
- \`data: {"type": "conversation", "conversationId": "..."}\` - ID conversation
- \`data: {"type": "start"}\` - Début du stream
- \`data: {"type": "chunk", "content": "..."}\` - Fragment de texte
- \`data: {"type": "citations", "citations": [...]}\` - Citations CGI
- \`data: {"type": "done", "metadata": {...}}\` - Fin avec métadonnées
- \`data: {"type": "error", "error": "..."}\` - Erreur
- \`data: [DONE]\` - Signal de fin

**Avantages:**
- Affichage progressif de la réponse
- Meilleure UX (pas d'attente longue)
- Réduction de la perception de latence`,
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChatMessageRequest' },
              example: {
                content: 'Quel est le taux de l\'IRPP ?',
                conversationId: null,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Stream SSE de la réponse',
            content: {
              'text/event-stream': {
                schema: {
                  type: 'string',
                  example: 'data: {"type": "chunk", "content": "Le taux..."}\n\n',
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { description: 'Quota mensuel dépassé' },
        },
      },
    },
    '/api/chat/conversations': {
      get: {
        tags: ['Chat'],
        summary: 'Liste des conversations',
        description: 'Retourne la liste des conversations de l\'utilisateur',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
        ],
        responses: {
          200: {
            description: 'Liste des conversations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    conversations: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Conversation' },
                    },
                    total: { type: 'number' },
                    page: { type: 'number' },
                    limit: { type: 'number' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/chat/conversations/{id}': {
      get: {
        tags: ['Chat'],
        summary: 'Détail conversation',
        description: 'Retourne une conversation avec ses messages',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          200: {
            description: 'Conversation avec messages',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ConversationWithMessages' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { description: 'Conversation non trouvée' },
        },
      },
      delete: {
        tags: ['Chat'],
        summary: 'Supprimer conversation',
        security: [{ BearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdParam' }],
        responses: {
          204: { description: 'Conversation supprimée' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { description: 'Conversation non trouvée' },
        },
      },
    },

    // ========== FISCAL ==========
    '/api/fiscal/irpp/calculate': {
      post: {
        tags: ['Fiscal'],
        summary: 'Calculer IRPP',
        description: 'Calcule l\'Impôt sur le Revenu des Personnes Physiques',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/IRPPRequest' },
              example: {
                revenuBrutAnnuel: 12000000,
                situationFamiliale: 'marie',
                nombreEnfants: 2,
                autresCharges: 0,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Résultat du calcul IRPP',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/IRPPResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/api/fiscal/its/calculate': {
      post: {
        tags: ['Fiscal'],
        summary: 'Calculer ITS',
        description: 'Calcule l\'Impôt sur les Traitements et Salaires (barème 2026)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ITSRequest' },
              example: {
                salaireBrutMensuel: 500000,
                situationFamiliale: 'marie',
                nombreEnfants: 2,
                avantagesNature: 50000,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Résultat du calcul ITS',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ITSResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/api/fiscal/is/calculate': {
      post: {
        tags: ['Fiscal'],
        summary: 'Calculer IS',
        description: 'Calcule l\'Impôt sur les Sociétés',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ISRequest' },
              example: {
                beneficeImposable: 50000000,
                typeEntreprise: 'standard',
                chiffreAffaires: 200000000,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Résultat du calcul IS',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ISResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    // ========== HEALTH ==========
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Status complet',
        description: 'Retourne le status de tous les services',
        responses: {
          200: {
            description: 'Tous les services sont opérationnels',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthStatus' },
              },
            },
          },
          503: { description: 'Un ou plusieurs services sont indisponibles' },
        },
      },
    },
    '/health/ping': {
      get: {
        tags: ['Health'],
        summary: 'Ping simple',
        responses: {
          200: {
            description: 'pong',
            content: { 'text/plain': { schema: { type: 'string', example: 'pong' } } },
          },
        },
      },
    },
    '/health/live': {
      get: {
        tags: ['Health'],
        summary: 'Liveness probe',
        description: 'Kubernetes liveness probe',
        responses: {
          200: { description: 'Application en vie' },
        },
      },
    },
    '/health/ready': {
      get: {
        tags: ['Health'],
        summary: 'Readiness probe',
        description: 'Kubernetes readiness probe',
        responses: {
          200: { description: 'Application prête' },
          503: { description: 'Application non prête' },
        },
      },
    },
    '/metrics': {
      get: {
        tags: ['Health'],
        summary: 'Métriques Prometheus',
        description: 'Expose les métriques au format Prometheus',
        responses: {
          200: {
            description: 'Métriques Prometheus',
            content: {
              'text/plain': {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },

  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token',
      },
    },
    parameters: {
      IdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Identifiant unique (UUID)',
      },
      PageParam: {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', minimum: 1, default: 1 },
        description: 'Numéro de page',
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        description: 'Nombre d\'éléments par page',
      },
    },
    responses: {
      Unauthorized: {
        description: 'Non authentifié',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Unauthorized' },
                message: { type: 'string', example: 'Token invalide ou expiré' },
              },
            },
          },
        },
      },
      ValidationError: {
        description: 'Erreur de validation',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    schemas: {
      // Auth schemas
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, description: 'Min 8 chars, 1 majuscule, 1 chiffre' },
          name: { type: 'string', minLength: 2 },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string' },
          expiresIn: { type: 'number', example: 900 },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // Chat schemas
      ChatMessageRequest: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', maxLength: 2000 },
          conversationId: { type: 'string', format: 'uuid', nullable: true },
        },
      },
      ChatMessageResponse: {
        type: 'object',
        properties: {
          response: { type: 'string' },
          conversationId: { type: 'string', format: 'uuid' },
          sources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                articleId: { type: 'string' },
                title: { type: 'string' },
                score: { type: 'number' },
              },
            },
          },
        },
      },
      Conversation: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          messageCount: { type: 'number' },
        },
      },
      ConversationWithMessages: {
        allOf: [
          { $ref: '#/components/schemas/Conversation' },
          {
            type: 'object',
            properties: {
              messages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    role: { type: 'string', enum: ['user', 'assistant'] },
                    content: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        ],
      },

      // Fiscal schemas
      IRPPRequest: {
        type: 'object',
        required: ['revenuBrutAnnuel'],
        properties: {
          revenuBrutAnnuel: { type: 'number', minimum: 0 },
          situationFamiliale: { type: 'string', enum: ['celibataire', 'marie', 'veuf', 'divorce'] },
          nombreEnfants: { type: 'integer', minimum: 0, maximum: 10 },
          autresCharges: { type: 'number', minimum: 0 },
        },
      },
      IRPPResponse: {
        type: 'object',
        properties: {
          revenuBrutAnnuel: { type: 'number' },
          revenuNetImposable: { type: 'number' },
          quotientFamilial: { type: 'number' },
          nombreParts: { type: 'number' },
          impotBrut: { type: 'number' },
          impotNet: { type: 'number' },
          tauxEffectif: { type: 'number' },
          detailTranches: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tranche: { type: 'string' },
                taux: { type: 'number' },
                montant: { type: 'number' },
              },
            },
          },
        },
      },
      ITSRequest: {
        type: 'object',
        required: ['salaireBrutMensuel'],
        properties: {
          salaireBrutMensuel: { type: 'number', minimum: 0 },
          situationFamiliale: { type: 'string', enum: ['celibataire', 'marie'] },
          nombreEnfants: { type: 'integer', minimum: 0, maximum: 6 },
          avantagesNature: { type: 'number', minimum: 0 },
        },
      },
      ITSResponse: {
        type: 'object',
        properties: {
          salaireBrut: { type: 'number' },
          cotisationsCNSS: { type: 'number' },
          salaireNetImposable: { type: 'number' },
          itsBrut: { type: 'number' },
          reductionChargesFamille: { type: 'number' },
          itsNet: { type: 'number' },
          salaireNet: { type: 'number' },
          tauxEffectif: { type: 'number' },
        },
      },
      ISRequest: {
        type: 'object',
        required: ['beneficeImposable'],
        properties: {
          beneficeImposable: { type: 'number' },
          typeEntreprise: { type: 'string', enum: ['standard', 'pme', 'zone_franche'] },
          chiffreAffaires: { type: 'number', minimum: 0 },
        },
      },
      ISResponse: {
        type: 'object',
        properties: {
          beneficeImposable: { type: 'number' },
          tauxApplicable: { type: 'number' },
          impotBrut: { type: 'number' },
          minimumPerception: { type: 'number' },
          impotDu: { type: 'number' },
          acomptes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                trimestre: { type: 'integer' },
                montant: { type: 'number' },
                echeance: { type: 'string' },
              },
            },
          },
        },
      },

      // Health schemas
      HealthStatus: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number' },
          services: {
            type: 'object',
            properties: {
              database: { type: 'string', enum: ['up', 'down'] },
              redis: { type: 'string', enum: ['up', 'down'] },
              qdrant: { type: 'string', enum: ['up', 'down'] },
            },
          },
        },
      },
    },
  },
};
