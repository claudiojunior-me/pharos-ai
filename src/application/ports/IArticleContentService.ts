export interface IArticleContentService {
  getReadingList(): Promise<{ url: string; title: string }[]>;
  getArticleContent(url: string): Promise<string>;
}
