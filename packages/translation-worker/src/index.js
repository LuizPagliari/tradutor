import dotenv from 'dotenv';
import { AppDataSource } from './infrastructure/database/data-source.js';
import { TypeORMTranslationRepository } from './infrastructure/repositories/TypeORMTranslationRepository.js';
import { TranslationWorkerService } from './application/services/TranslationWorkerService.js';
import { TranslationQueueConsumer } from './infrastructure/queue/TranslationQueueConsumer.js';

dotenv.config();

async function bootstrap() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Initialize dependencies
    const translationRepository = new TypeORMTranslationRepository();
    const translationWorkerService = new TranslationWorkerService(translationRepository);
    const queueConsumer = new TranslationQueueConsumer(translationWorkerService);

    // Start consuming messages
    await queueConsumer.start();

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Closing connections...');
      await queueConsumer.stop();
      await AppDataSource.destroy();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
}

bootstrap(); 