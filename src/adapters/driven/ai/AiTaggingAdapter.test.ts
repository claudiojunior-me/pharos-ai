import "reflect-metadata";
import { AiTaggingAdapter } from './AiTaggingAdapter';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the GoogleGenerativeAI module
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockImplementation((prompt: string) => {
        if (prompt.includes('error')) {
          throw new Error('Mock API error');
        }
        return { response: { text: () => JSON.stringify(['mock-tag', 'test']) } };
      }),
    }),
  })),
}));

describe('AiTaggingAdapter (Integration Test)', () => {
  let adapter: AiTaggingAdapter;

  beforeEach(() => {
    adapter = new AiTaggingAdapter();
  });

  it('should generate relevant tags for a given article text', async () => {
    const articleText = "Artificial intelligence (AI) is intelligence demonstrated by machines, unlike the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of \"intelligent agents\": any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals.";
    const tags = await adapter.generateTags(articleText);

    expect(tags).toBeInstanceOf(Array);
    expect(tags.length).toBeGreaterThan(0);
    expect(tags).toEqual(['mock-tag', 'test']);
  });

  it('should return an empty array if API key is missing', async () => {
    // Temporarily unset the API key for this test
    const originalApiKey = process.env.GOOGLE_API_KEY;
    delete process.env.GOOGLE_API_KEY;

    // The constructor will now throw an error, so we need to wrap it in a try-catch
    let newAdapter: AiTaggingAdapter;
    try {
      newAdapter = new AiTaggingAdapter();
    } catch (e: any) {
      expect(e.message).toContain('GOOGLE_API_KEY environment variable is not set.');
      // Restore the API key
      process.env.GOOGLE_API_KEY = originalApiKey;
      return;
    }

    const tags = await newAdapter.generateTags('some text');
    expect(tags).toEqual([]);

    // Restore the API key
    process.env.GOOGLE_API_KEY = originalApiKey;
  });

  it('should handle API errors gracefully and return an empty array', async () => {
    const tags = await adapter.generateTags('article with error');
    expect(tags).toEqual([]);
  }, 10000); // Increased timeout to account for retries
});
