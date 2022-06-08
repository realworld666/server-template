import { AuthUser } from '../../../public-api/auth-user';

/**
 * Base interface for cloud based user management service
 */
export interface IamService {
  /**
   * Register a new user
   * @param email the email of the user to create
   */
  createUser(email: string): Promise<void>;

  /**
   * Verify that a JWT token is valid
   * @param token the JWT token
   */
  verifyToken(token: string): Promise<AuthUser>;
}

export class AccountExistsError extends Error {}
