import { z } from 'zod';
import { RabbitMQService } from '../../infrastructure/queue/RabbitMQService.js';

const createTranslationSchema = z.object({
  text: z.string().min(1),
  targetLanguage: z.string().length(2),
  sourceLanguage: z.string().length(2).optional()
});

export class TranslationController {
  constructor(translationService, rabbitMQService) {
    this.translationService = translationService;
    this.rabbitMQService = rabbitMQService;
  }

  /**
   * @swagger
   * /api/translations:
   *   post:
   *     summary: Create a new translation request
   *     tags: [Translations]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TranslationRequest'
   *     responses:
   *       202:
   *         description: Translation request accepted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TranslationResponse'
   *       400:
   *         description: Invalid request data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async createTranslation(req, res) {
    try {
      const { text, targetLanguage, sourceLanguage = 'en' } = createTranslationSchema.parse(req.body);

      const translation = await this.translationService.createTranslationRequest(
        text,
        sourceLanguage,
        targetLanguage
      );

      res.status(202).json({
        requestId: translation.id,
        status: translation.status,
        message: 'Translation request received'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Invalid request data',
          details: error.errors
        });
        return;
      }

      console.error('Error creating translation request:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/translations/{requestId}:
   *   get:
   *     summary: Get the status of a translation request
   *     tags: [Translations]
   *     parameters:
   *       - in: path
   *         name: requestId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID of the translation request
   *     responses:
   *       200:
   *         description: Translation request status
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TranslationStatus'
   *       404:
   *         description: Translation request not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getTranslationStatus(req, res) {
    try {
      const { requestId } = req.params;
      const translation = await this.translationService.getTranslationStatus(requestId);

      if (!translation) {
        res.status(404).json({
          error: 'Translation request not found'
        });
        return;
      }

      res.json({
        requestId: translation.id,
        status: translation.status,
        originalText: translation.originalText,
        translatedText: translation.translatedText,
        sourceLanguage: translation.sourceLanguage,
        targetLanguage: translation.targetLanguage,
        error: translation.error,
        createdAt: translation.createdAt,
        updatedAt: translation.updatedAt
      });
    } catch (error) {
      console.error('Error getting translation status:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/languages:
   *   get:
   *     summary: Get list of supported languages
   *     tags: [Languages]
   *     responses:
   *       200:
   *         description: List of supported languages
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   code:
   *                     type: string
   *                     description: Language code (e.g., "en", "es")
   *                   name:
   *                     type: string
   *                     description: Language name (e.g., "English", "Spanish")
   *                   supportSource:
   *                     type: boolean
   *                     description: Whether the language can be used as source
   *                   supportTarget:
   *                     type: boolean
   *                     description: Whether the language can be used as target
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getSupportedLanguages(req, res) {
    try {
      const languages = await this.translationService.getSupportedLanguages();
      res.json(languages);
    } catch (error) {
      console.error('Error getting supported languages:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
} 