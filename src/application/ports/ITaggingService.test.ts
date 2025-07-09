import { ITaggingService } from './ITaggingService';

describe('ITaggingService', () => {
  class MockTaggingService implements ITaggingService {
    async generateTags(articleText: string): Promise<string[]> {
      if (articleText.includes('error')) {
        throw new Error('Mock tagging error');
      }
      return ['mock-tag1', 'mock-tag2'];
    }
  }

  let taggingService: ITaggingService;

  beforeEach(() => {
    taggingService = new MockTaggingService();
  });

  it('should generate tags for a given article text', async () => {
    const tags = await taggingService.generateTags('some article content');
    expect(tags).toEqual(['mock-tag1', 'mock-tag2']);
  });

  it('should throw an error if tagging fails', async () => {
    await expect(taggingService.generateTags('article with error')).rejects.toThrow('Mock tagging error');
  });
});
