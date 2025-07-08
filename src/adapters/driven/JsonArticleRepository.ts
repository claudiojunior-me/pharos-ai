import { IArticleRepository } from '../../application/ports/IArticleRepository';
import { Article } from '../../types/article';
import * as fs from 'fs/promises';
import * as path from 'path';

const ARTICLES_FILE = path.resolve(process.cwd(), 'articles.json');

export class JsonArticleRepository implements IArticleRepository {
  private async readArticlesFile(): Promise<Article[]> {
    try {
      const data = await fs.readFile(ARTICLES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return []; // File not found, return empty array
      }
      throw new Error(`Failed to read articles file: ${error.message}`);
    }
  }

  private async writeArticlesFile(articles: Article[]): Promise<void> {
    try {
      await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf8');
    } catch (error: any) {
      throw new Error(`Failed to write articles file: ${error.message}`);
    }
  }

  async loadArticles(): Promise<Article[]> {
    return this.readArticlesFile();
  }

  async saveArticles(articles: Article[]): Promise<void> {
    await this.writeArticlesFile(articles);
  }

  async addArticle(article: Article): Promise<void> {
    const articles = await this.readArticlesFile();
    articles.push(article);
    await this.writeArticlesFile(articles);
  }

  async updateArticle(article: Article): Promise<void> {
    let articles = await this.readArticlesFile();
    const index = articles.findIndex(a => a.url === article.url);
    if (index !== -1) {
      articles[index] = article;
      await this.writeArticlesFile(articles);
    } else {
      throw new Error(`Article with URL ${article.url} not found.`);
    }
  }
}
