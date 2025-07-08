import { IMarkdownConverter } from '../../application/ports/IMarkdownConverter';
import { injectable } from 'tsyringe';
import TurndownService from 'turndown';

@injectable()
export class TurndownMarkdownAdapter implements IMarkdownConverter {
  private turndownService: TurndownService;

  constructor() {
    this.turndownService = new TurndownService();
  }

  async convert(html: string): Promise<string> {
    return this.turndownService.turndown(html);
  }
}
