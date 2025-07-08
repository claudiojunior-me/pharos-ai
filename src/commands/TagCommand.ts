import { injectable, inject } from 'tsyringe';
import { ITagCommand } from '../application/ports/ITagCommand';
import { IArticleRepository } from '../application/ports/IArticleRepository';
import { IArticleContentService } from '../application/ports/IArticleContentService';
import { ITaggingService } from '../application/ports/ITaggingService';
import { Article } from '../types/article';

@injectable()
export class TagCommand implements ITagCommand {
  constructor(
    @inject('IArticleRepository') private articleRepository: IArticleRepository,
    @inject('IArticleContentService') private articleContentService: IArticleContentService,
    @inject('ITaggingService') private taggingService: ITaggingService
  ) {}

  async execute(source: string, destination: string): Promise<void> {
    console.log(`Executing Tag Command: source=${source}, destination=${destination}`);

    try {
      // 1. Load existing articles
      console.log('Step 1/6: Loading existing articles...');
      const existingArticles = await this.articleRepository.loadArticles();
      console.log(`Loaded ${existingArticles.length} existing articles.`);

      // 2. Fetch current reading list from Medium
      console.log('Step 2/6: Fetching current reading list from Medium...');
      const readingList = await this.articleContentService.getReadingList();
      console.log(`Fetched ${readingList.length} articles from reading list.`);

      // 3. Identify new articles not in state
      console.log('Step 3/6: Identifying new articles...');
      const newArticlesToProcess = readingList.filter(readingListItem =>
        !existingArticles.some(existingArticle => existingArticle.url === readingListItem.url)
      );
      console.log(`Found ${newArticlesToProcess.length} new articles to process.`);

      for (const newArticleItem of newArticlesToProcess) {
        console.log(`\nProcessing new article: ${newArticleItem.title} (${newArticleItem.url})`);

        try {
          // 4. Extract content for new articles
          console.log('Step 4/6: Extracting content...');
          const articleContent = await this.articleContentService.getArticleContent(newArticleItem.url);
          console.log(`Extracted content for ${newArticleItem.title}. Content length: ${articleContent.length}`);

          // 5. Generate tags using AI
          console.log('Step 5/6: Generating tags using AI...');
          const generatedTags = await this.taggingService.generateTags(articleContent);
          console.log(`Generated tags for ${newArticleItem.title}: ${generatedTags.join(', ')}`);

          // 6. Save updated articles
          console.log('Step 6/6: Saving updated article...');
          const newArticle: Article = {
            url: newArticleItem.url,
            title: newArticleItem.title,
            tags: [...generatedTags, destination], // Add destination as a tag
            processed: true,
          };
          await this.articleRepository.addArticle(newArticle);
          console.log(`Article ${newArticleItem.title} saved with tags.`);
        } catch (articleError) {
          console.error(`Error processing article ${newArticleItem.title}:`, articleError);
        }
      }

      console.log('\nTag Command execution complete.');
    } catch (error) {
      console.error('Tag Command failed:', error);
      throw error; // Re-throw to propagate the error
    }
  }
}
