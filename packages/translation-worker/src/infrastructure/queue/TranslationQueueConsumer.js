import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

export class TranslationQueueConsumer {
  constructor(translationWorkerService) {
    this.translationWorkerService = translationWorkerService;
    this.connection = null;
    this.channel = null;
  }

  async start() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
      this.channel = await this.connection.createChannel();

      const exchange = process.env.TRANSLATION_EXCHANGE || 'translation_exchange';
      const queue = process.env.TRANSLATION_QUEUE || 'translation_queue';
      const routingKey = process.env.TRANSLATION_ROUTING_KEY || 'translation.request';

      await this.channel.assertExchange(exchange, 'direct', { durable: true });
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.bindQueue(queue, exchange, routingKey);

      // Set prefetch to 1 to process one message at a time
      await this.channel.prefetch(1);

      console.log('Starting to consume translation requests...');

      await this.channel.consume(queue, async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          const { translationId } = content;

          console.log(`Processing translation request: ${translationId}`);
          await this.translationWorkerService.processTranslation(translationId);
          console.log(`Translation request ${translationId} processed successfully`);

          this.channel?.ack(msg);
        } catch (error) {
          console.error('Error processing translation request:', error);
          // Reject the message and requeue it
          this.channel?.nack(msg, false, true);
        }
      });

      console.log('Translation queue consumer started');
    } catch (error) {
      console.error('Failed to start queue consumer:', error);
      throw error;
    }
  }

  async stop() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
} 