import { IArticleContentService } from '../../application/ports/IArticleContentService';
import { IAuthenticationService } from '../../application/ports/IAuthenticationService';
import { inject, injectable } from 'tsyringe';
import puppeteer, { Browser, Page } from 'puppeteer';
import { mediumSelectors } from '../../config/mediumSelectors';

@injectable()
export class MediumScraper implements IArticleContentService {
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(
    @inject('IAuthenticationService') private authService: IAuthenticationService
  ) {}

  private async initializeBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({ headless: "new" });
    }
    if (!this.page) {
      this.page = await this.browser.newPage();
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getReadingList(): Promise<{ url: string; title: string }[]> {
    await this.initializeBrowser();
    try {
      // Assuming authentication is handled by authService before this is called
      // Navigate to Medium reading list page
      await this.page!.goto('https://medium.com/me/list/reading', { waitUntil: 'networkidle2' });
      await this.delay(2000); // Simulate rate limiting

      const articles = await this.page!.$eval(mediumSelectors.readingListItem, (items, selectors) => {
        return items.map(item => ({
          url: item.querySelector(selectors.readingListUrl)?.getAttribute('href') || '',
          title: item.querySelector(selectors.readingListTitle)?.textContent?.trim() || '',
        }));
      }, mediumSelectors);

      return articles.filter(article => article.url && article.title);
    } catch (error) {
      console.error('Error fetching reading list:', error);
      return [];
    }
  }

  async getArticleContent(url: string): Promise<string> {
    await this.initializeBrowser();
    try {
      // Assuming authentication is handled by authService before this is called
      await this.page!.goto(url, { waitUntil: 'networkidle2' });
      await this.delay(2000); // Simulate rate limiting

      const content = await this.page!.$eval(mediumSelectors.articleContent, (element) => {
        return element.textContent?.trim() || '';
      });

      return content;
    } catch (error) {
      console.error(`Error fetching content for ${url}:`, error);
      return '';
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}
