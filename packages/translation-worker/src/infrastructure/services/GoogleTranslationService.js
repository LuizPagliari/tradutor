import { TranslationServiceClient } from '@google-cloud/translate';

export class GoogleTranslationService {
  constructor() {
    this.client = new TranslationServiceClient();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    this.location = 'global'; // ou uma região específica se necessário
  }

  async translateText(text, sourceLanguage, targetLanguage) {
    try {
      const request = {
        parent: `projects/${this.projectId}/locations/${this.location}`,
        contents: [text],
        mimeType: 'text/plain',
        sourceLanguageCode: sourceLanguage,
        targetLanguageCode: targetLanguage,
      };

      const [response] = await this.client.translateText(request);
      
      if (!response.translations || response.translations.length === 0) {
        throw new Error('No translation received from Google Translate API');
      }

      return response.translations[0].translatedText;
    } catch (error) {
      console.error('Error translating text with Google Translate:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  // Método auxiliar para obter a lista de idiomas suportados
  async getSupportedLanguages() {
    try {
      const request = {
        parent: `projects/${this.projectId}/locations/${this.location}`,
      };

      const [response] = await this.client.getSupportedLanguages(request);
      return response.languages.map(lang => ({
        code: lang.languageCode,
        name: lang.displayName,
        supportSource: lang.supportSource,
        supportTarget: lang.supportTarget,
      }));
    } catch (error) {
      console.error('Error getting supported languages:', error);
      throw new Error(`Failed to get supported languages: ${error.message}`);
    }
  }
} 