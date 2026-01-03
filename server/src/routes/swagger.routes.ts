/**
 * Swagger UI Routes
 * Expose API documentation at /api-docs
 */

import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from '../config/swagger.js';

const router = Router();

// Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CGI-ENGINE API Documentation',
  customfavIcon: '/favicon.ico',
}));

// JSON spec endpoint
router.get('/json', (_req, res) => {
  res.json(swaggerDocument);
});

export default router;
