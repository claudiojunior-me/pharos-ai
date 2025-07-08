export class EmailServiceError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'EmailServiceError';
    Object.setPrototypeOf(this, EmailServiceError.prototype);
  }
}
