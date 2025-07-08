import "reflect-metadata";
import { TagCommand } from './TagCommand';
import { IArticleRepository } from '../application/ports/IArticleRepository';
import { IArticleContentService } from '../application/ports/IArticleContentService';
import { ITaggingService } from '../application/ports/ITaggingService';
import { Article } from '../types/article';

describe('TagCommand', () => {
  let tagCommand: TagCommand;
  let mockArticleRepository: jest.Mocked<IArticleRepository>;
  let mockArticleContentService: jest.Mocked<IArticleContentService>;
  let mockTaggingService: jest.Mocked<ITaggingService>;

  beforeEach(() => {
    mockArticleRepository = {
      loadArticles: jest.fn(),
      saveArticles: jest.fn(),
      addArticle: jest.fn(),
      updateArticle: jest.fn(),
    };
    mockArticleContentService = {
      getReadingList: jest.fn(),
      getArticleContent: jest.fn(),
    };
    mockTaggingService = {
      generateTags: jest.fn(),
    };

    tagCommand = new TagCommand(
      mockArticleRepository,
      mockArticleContentService,
      mockTaggingService
    );
  });

  it('should process new articles, generate tags, and save them', async () => {
    const existingArticles: Article[] = [
      { url: 'http://old.com', title: 'Old Article', tags: ['old'], processed: true },
    ];
    const readingList = [
      { url: 'http://old.com', title: 'Old Article' },
      { url: 'http://new.com', title: 'New Article' },
    ];
    const articleContent = 'Content of new article';
    const generatedTags = ['tech', 'ai'];

    mockArticleRepository.loadArticles.mockResolvedValue(existingArticles);
    mockArticleContentService.getReadingList.mockResolvedValue(readingList);
    mockArticleContentService.getArticleContent.mockResolvedValue(articleContent);
    mockTaggingService.generateTags.mockResolvedValue(generatedTags);
    mockArticleRepository.addArticle.mockResolvedValue(undefined);

    await tagCommand.execute('medium', 'obsidian');

    expect(mockArticleRepository.loadArticles).toHaveBeenCalledTimes(1);
    expect(mockArticleContentService.getReadingList).toHaveBeenCalledTimes(1);
    expect(mockArticleContentService.getArticleContent).toHaveBeenCalledWith('http://new.com');
    expect(mockTaggingService.generateTags).toHaveBeenCalledWith(articleContent);
    expect(mockArticleRepository.addArticle).toHaveBeenCalledWith({
      url: 'http://new.com',
      title: 'New Article',
      tags: ['tech', 'ai', 'obsidian'],
      processed: true,
    });
    expect(mockArticleRepository.addArticle).toHaveBeenCalledTimes(1);
  });

  it('should handle errors during article content extraction', async () => {
    const existingArticles: Article[] = [];
    const readingList = [
      { url: 'http://error.com', title: 'Error Article' },
    ];

    mockArticleRepository.loadArticles.mockResolvedValue(existingArticles);
    mockArticleContentService.getReadingList.mockResolvedValue(readingList);
    mockArticleContentService.getArticleContent.mockRejectedValue(new Error('Failed to extract content'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await tagCommand.execute('medium', 'obsidian');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error processing article Error Article'),
      expect.any(Error)
    );
    expect(mockArticleRepository.addArticle).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should handle errors during tag generation', async () => {
    const existingArticles: Article[] = [];
    const readingList = [
      { url: 'http://tag-error.com', title: 'Tag Error Article' },
    ];
    const articleContent = 'Content of tag error article';

    mockArticleRepository.loadArticles.mockResolvedValue(existingArticles);
    mockArticleContentService.getReadingList.mockResolvedValue(readingList);
    mockArticleContentService.getArticleContent.mockResolvedValue(articleContent);
    mockTaggingService.generateTags.mockRejectedValue(new Error('Failed to generate tags'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await tagCommand.execute('medium', 'obsidian');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error processing article Tag Error Article'),
      expect.any(Error)
    );
    expect(mockArticleRepository.addArticle).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should handle errors during saving articles', async () => {
    const existingArticles: Article[] = [];
    const readingList = [
      { url: 'http://save-error.com', title: 'Save Error Article' },
    ];
    const articleContent = 'Content of save error article';
    const generatedTags = ['save', 'error'];

    mockArticleRepository.loadArticles.mockResolvedValue(existingArticles);
    mockArticleContentService.getReadingList.mockResolvedValue(readingList);
    mockArticleContentService.getArticleContent.mockResolvedValue(articleContent);
    mockTaggingService.generateTags.mockResolvedValue(generatedTags);
    mockArticleRepository.addArticle.mockRejectedValue(new Error('Failed to save article'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await tagCommand.execute('medium', 'obsidian');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error processing article Save Error Article'),
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should not process existing articles', async () => {
    const existingArticles: Article[] = [
      { url: 'http://existing.com', title: 'Existing Article', tags: ['old'], processed: true },
    ];
    const readingList = [
      { url: 'http://existing.com', title: 'Existing Article' },
    ];

    mockArticleRepository.loadArticles.mockResolvedValue(existingArticles);
    mockArticleContentService.getReadingList.mockResolvedValue(readingList);

    await tagCommand.execute('medium', 'obsidian');

    expect(mockArticleContentService.getArticleContent).not.toHaveBeenCalled();
    expect(mockTaggingService.generateTags).not.toHaveBeenCalled();
    expect(mockArticleRepository.addArticle).not.toHaveBeenCalled();
  });
});
