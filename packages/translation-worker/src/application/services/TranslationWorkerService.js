import { GoogleTranslationService } from '../../infrastructure/services/GoogleTranslationService.js';

// Mock translation function - in a real application, this would use a translation API
async function translateText(text, sourceLanguage, targetLanguage) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock translations for demonstration
  const translations = {
    'en': {
      'es': {
        'hello': 'hola',
        'world': 'mundo',
        'good morning': 'buenos días',
        'how are you': 'cómo estás'
      },
      'fr': {
        'hello': 'bonjour',
        'world': 'monde',
        'good morning': 'bonjour',
        'how are you': 'comment allez-vous'
      }
    }
  };

  const translationMap = translations[sourceLanguage]?.[targetLanguage];
  if (!translationMap) {
    throw new Error(`Translation not supported from ${sourceLanguage} to ${targetLanguage}`);
  }

  // Simple word-by-word translation for demonstration
  const words = text.toLowerCase().split(' ');
  const translatedWords = words.map(word => translationMap[word] || word);
  return translatedWords.join(' ');
}

export class TranslationWorkerService {
  constructor(translationRepository) {
    this.translationRepository = translationRepository;
    this.translationService = new GoogleTranslationService();
  }

  async processTranslation(translationId) {
    const translation = await this.translationRepository.findById(translationId);
    
    if (!translation) {
      throw new Error(`Translation request ${translationId} not found`);
    }

    try {
      // Mark as processing
      translation.markAsProcessing();
      await this.translationRepository.update(translation);

      // Perform translation using Google Translate
      const translatedText = await this.translationService.translateText(
        translation.originalText,
        translation.sourceLanguage,
        translation.targetLanguage
      );

      // Update with result
      translation.complete(translatedText);
      await this.translationRepository.update(translation);
    } catch (error) {
      // Handle failure
      translation.fail(error instanceof Error ? error.message : 'Unknown error');
      await this.translationRepository.update(translation);
      throw error;
    }
  }

  // Método auxiliar para obter idiomas suportados
  async getSupportedLanguages() {
    return this.translationService.getSupportedLanguages();
  }
} 