import { inject, injectable } from 'tsyringe';
import { ICliService } from '../../application/ports/ICliService';
import { IArticleRepository } from '../../application/ports/IArticleRepository';
import { Article } from '../../types/article';

@injectable()
export class TagContentUseCase implements ICliService {
  constructor(
    @inject('IArticleRepository') private articleRepository: IArticleRepository
  ) {}

  async tag(source: string, destination: string): Promise<void> {
    console.log(`Tagging content from ${source} to ${destination} (Use Case Implementation)`);
    // Example: Add a new article or update an existing one
    const newArticle: Article = {
      url: source,
      title: `Tagged from ${source}`,
      tags: [destination],
      processed: true,
    };
    await this.articleRepository.addArticle(newArticle);
    console.log('Article added/updated in repository.');
  }

  async export(source: string, theme?: string, count?: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
