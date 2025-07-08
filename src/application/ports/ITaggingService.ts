export interface ITaggingService {
  generateTags(articleText: string): Promise<string[]>;
}
