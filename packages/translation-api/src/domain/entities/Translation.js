import { EntitySchema } from 'typeorm';

export const TranslationStatus = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export class Translation {
  constructor() {
    this.originalText = '';
    this.translatedText = null;
    this.sourceLanguage = '';
    this.targetLanguage = '';
    this.status = TranslationStatus.QUEUED;
    this.error = null;
  }

  static create(originalText, sourceLanguage, targetLanguage) {
    const translation = new Translation();
    translation.originalText = originalText;
    translation.sourceLanguage = sourceLanguage;
    translation.targetLanguage = targetLanguage;
    translation.status = TranslationStatus.QUEUED;
    return translation;
  }

  markAsProcessing() {
    this.status = TranslationStatus.PROCESSING;
  }

  complete(translatedText) {
    this.translatedText = translatedText;
    this.status = TranslationStatus.COMPLETED;
  }

  fail(error) {
    this.error = error;
    this.status = TranslationStatus.FAILED;
  }
}

export const TranslationSchema = new EntitySchema({
  name: 'Translation',
  target: Translation,
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    originalText: {
      type: 'text'
    },
    translatedText: {
      type: 'text',
      nullable: true
    },
    sourceLanguage: {
      type: 'varchar',
      length: 2
    },
    targetLanguage: {
      type: 'varchar',
      length: 2
    },
    status: {
      type: 'enum',
      enum: Object.values(TranslationStatus),
      default: TranslationStatus.QUEUED
    },
    error: {
      type: 'text',
      nullable: true
    },
    createdAt: {
      type: 'timestamp',
      createDate: true
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true
    }
  }
}); 