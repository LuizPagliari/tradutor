import { Router } from 'express';

export function createTranslationRoutes(controller) {
  const router = Router();

  router.post('/translations', (req, res) => controller.createTranslation(req, res));
  router.get('/translations/:requestId', (req, res) => controller.getTranslationStatus(req, res));
  router.get('/languages', (req, res) => controller.getSupportedLanguages(req, res));

  return router;
} 