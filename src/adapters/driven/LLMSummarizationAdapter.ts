import { ISummarizationService } from '../../application/ports/ISummarizationService';
import { injectable } from 'tsyringe';
import { GoogleGenerativeAI } from '@google/generative-ai';

@injectable()
export class LLMSummarizationAdapter implements ISummarizationService {
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

  async summarize(text: string): Promise<string> {
    const prompt = `Summarize the following text concisely. Provide only the summary, no other text or introduction.\n\nText: ${text}\n\nSummary:`;

    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();
        return summary;
      } catch (error) {
        console.error(`Error summarizing text with AI (attempt ${retries + 1}/${maxRetries}):`, error);
        retries++;
        if (retries < maxRetries) {
          await this.delay(2000 * retries); // Exponential backoff
        }
      }
    }
    throw new Error('Summarization failed after multiple retries.');
  }
}