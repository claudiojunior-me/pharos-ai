export interface ISummarizationService {
  summarize(text: string): Promise<string>;
}
