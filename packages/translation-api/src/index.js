import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './infrastructure/database/data-source.js';
import { TypeORMTranslationRepository } from './infrastructure/repositories/TypeORMTranslationRepository.js';
import { RabbitMQService } from './infrastructure/queue/RabbitMQService.js';
import { TranslationService } from './application/services/TranslationService.js';
import { TranslationController } from './interfaces/controllers/TranslationController.js';
import { createTranslationRoutes } from './interfaces/routes/translationRoutes.js';
import { swaggerSpec } from './infrastructure/swagger/swagger.js';

dotenv.config();

async function bootstrap() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Initialize RabbitMQ service
    const rabbitMQService = new RabbitMQService();

    // Initialize dependencies
    const translationRepository = new TypeORMTranslationRepository();
    const translationService = new TranslationService(translationRepository, rabbitMQService);
    const translationController = new TranslationController(translationService);

    // Create Express application
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Swagger documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: "Translation Service API Documentation"
    }));

    // Routes
    app.use('/api', createTranslationRoutes(translationController));

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Internal server error' });
    });

    // Start server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API Documentation available at http://localhost:${port}/api-docs`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Closing connections...');
      await rabbitMQService.close();
      await AppDataSource.destroy();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap(); 