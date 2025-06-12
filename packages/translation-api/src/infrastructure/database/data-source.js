import { DataSource } from 'typeorm';
import { TranslationSchema } from '../../domain/entities/Translation.js';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'translation_service',
  dropSchema: process.env.NODE_ENV === 'development',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [TranslationSchema],
  migrations: [],
  subscribers: [],
});

console.log('AppDataSource synchronize setting:', AppDataSource.options.synchronize); 