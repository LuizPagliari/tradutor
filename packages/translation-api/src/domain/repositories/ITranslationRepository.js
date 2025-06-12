/**
 * @typedef {import('../entities/Translation').Translation} Translation
 */

/**
 * @interface ITranslationRepository
 */
export class ITranslationRepository {
  /**
   * @param {Translation} translation
   * @returns {Promise<Translation>}
   */
  async save(translation) {
    throw new Error('Method not implemented');
  }

  /**
   * @param {string} id
   * @returns {Promise<Translation|null>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * @param {Translation} translation
   * @returns {Promise<Translation>}
   */
  async update(translation) {
    throw new Error('Method not implemented');
  }
} 