import { ITranslationService } from '../../application/ports/ITranslationService';
import { injectable } from 'tsyringe';
import { Translate } from '@google-cloud/translate/build/src/v2';

@injectable()
export class GoogleTranslateAdapter implements ITranslationService {
  private translateClient: Translate;

  constructor() {
    // Ensure GOOGLE_APPLICATION_CREDENTIALS environment variable is set
    // or provide project ID directly if not using default credentials
    this.translateClient = new Translate();
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async translate(text: string, targetLanguage: string): Promise<string> {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const [translation] = await this.translateClient.translate(text, targetLanguage);
        return translation;
      } catch (error) {
        console.error(`Error translating text (attempt ${retries + 1}/${maxRetries}):`, error);
        retries++;
        if (retries < maxRetries) {
          await this.delay(2000 * retries); // Exponential backoff
        }
      }
    }
    throw new Error('Translation failed after multiple retries.');
  }
}
