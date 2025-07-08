import { inject, injectable } from 'tsyringe';
import { ICliService } from '../../application/ports/ICliService';
import { IArticleRepository } from '../../application/ports/IArticleRepository';

@injectable()
export class ExportContentUseCase implements ICliService {
  constructor(
    @inject('IArticleRepository') private articleRepository: IArticleRepository
  ) {}

  async tag(source: string, destination: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async export(source: string, theme?: string, count?: number): Promise<void> {
    console.log(`Exporting content from ${source} with theme ${theme || 'default'} and count ${count || 'all'} (Use Case Implementation)`);
    const articles = await this.articleRepository.loadArticles();
    console.log('Loaded articles:', articles);
    // TODO: Implement actual export logic based on loaded articles
  }
}
