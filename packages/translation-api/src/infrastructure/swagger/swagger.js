import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Translation Service API',
      version: '1.0.0',
      description: 'API for asynchronous translation service using Google Cloud Translation',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        TranslationRequest: {
          type: 'object',
          required: ['text', 'targetLanguage'],
          properties: {
            text: {
              type: 'string',
              description: 'Text to be translated',
              example: 'Hello World'
            },
            targetLanguage: {
              type: 'string',
              description: 'Target language code (e.g., "es" for Spanish)',
              minLength: 2,
              maxLength: 2,
              example: 'pt'
            },
            sourceLanguage: {
              type: 'string',
              description: 'Source language code (e.g., "en" for English). Defaults to "en" if not provided.',
              minLength: 2,
              maxLength: 2,
              example: 'en'
            }
          }
        },
        TranslationResponse: {
          type: 'object',
          properties: {
            requestId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the translation request',
              example: 'a-unique-uuid-for-the-request'
            },
            status: {
              type: 'string',
              enum: ['queued', 'processing', 'completed', 'failed'],
              description: 'Current status of the translation request',
              example: 'processing'
            },
            message: {
              type: 'string',
              description: 'Status message'
            }
          }
        },
        TranslationStatus: {
          type: 'object',
          properties: {
            requestId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the translation request',
              example: 'a-unique-uuid-for-the-request'
            },
            status: {
              type: 'string',
              enum: ['queued', 'processing', 'completed', 'failed'],
              description: 'Current status of the translation request',
              example: 'completed'
            },
            originalText: {
              type: 'string',
              description: 'Original text to be translated',
              example: 'Hello World'
            },
            translatedText: {
              type: 'string',
              description: 'Translated text (available when status is completed)',
              nullable: true,
              example: 'Olá Mundo'
            },
            sourceLanguage: {
              type: 'string',
              description: 'Source language code',
              example: 'en'
            },
            targetLanguage: {
              type: 'string',
              description: 'Target language code',
              example: 'pt'
            },
            error: {
              type: 'string',
              description: 'Error message (available when status is failed)',
              nullable: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the translation request was created'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the translation request was last updated'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              },
              description: 'Detailed error information (for validation errors)'
            }
          }
        }
      }
    }
  },
  apis: ['./src/interfaces/routes/*.js', './src/interfaces/controllers/*.js']
};

export const swaggerSpec = swaggerJsdoc(options); 