import { Article } from '../../types/article';

export interface IArticleRepository {
  loadArticles(): Promise<Article[]>;
  saveArticles(articles: Article[]): Promise<void>;
  addArticle(article: Article): Promise<void>;
  updateArticle(article: Article): Promise<void>;
}
