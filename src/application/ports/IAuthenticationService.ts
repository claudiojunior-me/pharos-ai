export interface IAuthenticationService {
  authenticate(username: string, password: string): Promise<boolean>;
  isAuthenticated(): Promise<boolean>;
  getSession(): Promise<any>; // Consider defining a more specific session type
}
