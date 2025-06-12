import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

export class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.initialize();
  }

  async initialize() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
      this.channel = await this.connection.createChannel();

      const exchange = process.env.TRANSLATION_EXCHANGE || 'translation_exchange';
      const queue = process.env.TRANSLATION_QUEUE || 'translation_queue';
      const routingKey = process.env.TRANSLATION_ROUTING_KEY || 'translation.request';

      await this.channel.assertExchange(exchange, 'direct', { durable: true });
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.bindQueue(queue, exchange, routingKey);

      console.log('RabbitMQ connection established');
    } catch (error) {
      console.error('Failed to initialize RabbitMQ:', error);
      throw error;
    }
  }

  async publishMessage(message) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const exchange = process.env.TRANSLATION_EXCHANGE || 'translation_exchange';
    const routingKey = process.env.TRANSLATION_ROUTING_KEY || 'translation.request';

    await this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
} 