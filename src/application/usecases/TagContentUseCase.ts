import { ICliService } from '../../application/ports/ICliService';

export class TagContentUseCase implements ICliService {
  async tag(source: string, destination: string): Promise<void> {
    console.log(`Tagging content from ${source} to ${destination} (Use Case Implementation)`);
    // TODO: Implement actual tagging logic
  }

  async export(source: string, theme?: string, count?: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
