import { inject, injectable } from 'tsyringe';
import { ICliService } from '../../application/ports/ICliService';
import { IArticleRepository } from '../../application/ports/IArticleRepository';
import { ITaggingService } from '../../application/ports/ITaggingService';
import { Article } from '../../types/article';

@injectable()
export class TagContentUseCase implements ICliService {
  constructor(
    @inject('IArticleRepository') private articleRepository: IArticleRepository,
    @inject('ITaggingService') private taggingService: ITaggingService
  ) {}

  async tag(source: string, destination: string): Promise<void> {
    console.log(`Tagging content from ${source} to ${destination} (Use Case Implementation)`);
    // For demonstration, let's assume we have some article content to tag
    const dummyArticleContent = `This is a sample article about technology and artificial intelligence. It discusses machine learning algorithms and their applications.`;
    const generatedTags = await this.taggingService.generateTags(dummyArticleContent);

    const newArticle: Article = {
      url: source,
      title: `Tagged from ${source}`,
      tags: [...generatedTags, destination], // Combine generated tags with destination as a tag
      processed: true,
    };
    await this.articleRepository.addArticle(newArticle);
    console.log('Article added/updated in repository with generated tags.');
  }

  async export(source: string, theme?: string, count?: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
