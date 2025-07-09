import { ITaggingService } from '../../../application/ports/ITaggingService';
import { injectable } from 'tsyringe';
import { GoogleGenerativeAI } from '@google/generative-ai';

@injectable()
export class AiTaggingAdapter implements ITaggingService {
  private genAI: GoogleGenerativeAI;
  private model: any; // Gemini model

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is not set.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview-05-06" });
  }

  

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateTags(articleText: string): Promise<string[]> {
    const prompt = `Analyze the following article text and generate a JSON array of relevant, concise tags. Each tag should be a single word or a short phrase (max 3 words). Focus on keywords and main topics. Do not include any other text or explanation, only the JSON array.\n\nExample output: ["technology", "AI", "machine learning"]\n\nArticle: ${articleText}\n\nTags:`;

    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        try {
          return JSON.parse(text);
        } catch (jsonError) {
          console.error('Error parsing JSON response from AI:', jsonError);
          return [];
        }
      } catch (error) {
        console.error(`Error generating tags with AI (attempt ${retries + 1}/${maxRetries}):`, error);
        retries++;
        if (retries < maxRetries) {
          await this.delay(2000 * retries); // Exponential backoff
        }
      }
    }
    return []; // Return empty array after all retries fail
  }
}
