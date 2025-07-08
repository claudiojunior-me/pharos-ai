export interface ICliService {
  tag(source: string, destination: string): Promise<void>;
  export(source: string, theme?: string, count?: number): Promise<void>;
}
