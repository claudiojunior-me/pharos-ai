import { injectable, inject } from 'tsyringe';
import { IMarkdownConverter } from '../application/ports/IMarkdownConverter';
import { ITranslationService } from '../application/ports/ITranslationService';
import { ISummarizationService } from '../application/ports/ISummarizationService';

@injectable()
export class ContentProcessingService {
  constructor(
    @inject('IMarkdownConverter') private markdownConverter: IMarkdownConverter,
    @inject('ITranslationService') private translationService: ITranslationService,
    @inject('ISummarizationService') private summarizationService: ISummarizationService
  ) {}

  async processContent(htmlContent: string, targetLanguage: string): Promise<{
    markdown: string;
    translatedSummary: string;
  }> {
    // 1. Convert HTML to Markdown
    const markdown = await this.markdownConverter.convert(htmlContent);

    // 2. Summarize the Markdown content
    const summary = await this.summarizationService.summarize(markdown);

    // 3. Translate the summary
    const translatedSummary = await this.translationService.translate(summary, targetLanguage);

    return { markdown, translatedSummary };
  }
}
