import { Repository } from 'typeorm';
import { Translation } from '../../domain/entities/Translation.js';
import { ITranslationRepository } from '../../domain/repositories/ITranslationRepository.js';
import { AppDataSource } from '../database/data-source.js';

export class TypeORMTranslationRepository extends ITranslationRepository {
  constructor() {
    super();
    this.repository = AppDataSource.getRepository(Translation);
  }

  async save(translation) {
    return this.repository.save(translation);
  }

  async findById(id) {
    return this.repository.findOneBy({ id });
  }

  async update(translation) {
    return this.repository.save(translation);
  }
} 