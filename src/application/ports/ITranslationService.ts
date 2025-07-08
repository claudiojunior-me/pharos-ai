export interface ITranslationService {
  translate(text: string, targetLanguage: string): Promise<string>;
}
