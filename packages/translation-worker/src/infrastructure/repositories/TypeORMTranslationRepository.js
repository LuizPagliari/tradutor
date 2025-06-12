import { Repository } from 'typeorm';
import { Translation } from '../../domain/entities/Translation.js';
import { ITranslationRepository } from '../../domain/repositories/ITranslationRepository.js'; // Note: This might be a missing file for the worker if it was deleted
import { AppDataSource } from '../database/data-source.js';

// We need to define ITranslationRepository for the worker as well, or ensure it's shared.
// For now, let's assume it should exist in the worker's domain.
// If it doesn't exist, we'll need to create that too.

export class TypeORMTranslationRepository extends ITranslationRepository {
  constructor() {
    super();
    this.repository = AppDataSource.getRepository(Translation);
  }

  /**
   * @param {Translation} translation
   * @returns {Promise<Translation>}
   */
  async save(translation) {
    return this.repository.save(translation);
  }

  /**
   * @param {string} id
   * @returns {Promise<Translation|null>}
   */
  async findById(id) {
    return this.repository.findOneBy({ id });
  }

  /**
   * @param {Translation} translation
   * @returns {Promise<Translation>}
   */
  async update(translation) {
    return this.repository.save(translation);
  }
} 