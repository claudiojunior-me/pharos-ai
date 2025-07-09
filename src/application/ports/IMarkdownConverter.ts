export interface IMarkdownConverter {
  convert(html: string): Promise<string>;
}
