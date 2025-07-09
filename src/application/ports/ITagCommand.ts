export interface ITagCommand {
  execute(source: string, destination: string): Promise<void>;
}
