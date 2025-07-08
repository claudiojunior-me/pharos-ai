export interface IEmailService {
  sendToKindle(title: string, content: string, theme: string, recipientEmail: string): Promise<boolean>;
}
