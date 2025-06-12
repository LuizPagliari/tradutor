import { Translation } from '../../domain/entities/Translation.js';
import { GoogleTranslationService } from '../../infrastructure/services/GoogleTranslationService.js';

export class TranslationService {
  constructor(translationRepository, rabbitMQService) {
    this.translationRepository = translationRepository;
    this.rabbitMQService = rabbitMQService;
    this.googleTranslationService = new GoogleTranslationService();

    console.log('GOOGLE_APPLICATION_CREDENTIALS in API service:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('GOOGLE_CLOUD_PROJECT in API service:', process.env.GOOGLE_CLOUD_PROJECT);
  }

  async createTranslationRequest(text, sourceLanguage, targetLanguage) {
    const translation = Translation.create(text, sourceLanguage, targetLanguage);
    const savedTranslation = await this.translationRepository.save(translation);

    await this.rabbitMQService.publishMessage({
      translationId: savedTranslation.id,
      text,
      sourceLanguage,
      targetLanguage
    });

    return savedTranslation;
  }

  async getTranslationStatus(id) {
    return this.translationRepository.findById(id);
  }

  async getSupportedLanguages() {
    return this.googleTranslationService.getSupportedLanguages();
  }
} 