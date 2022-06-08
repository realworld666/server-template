import { inject, singleton } from 'tsyringe';

import { auth } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { AccountExistsError, IamService } from '../../common/iam/iam-service';
import ApiError from '../../../api-error';

import { AuthUser } from '../../../public-api/auth-user';
import { FirebaseAuthConfig } from './auth-config';
import { Configurable } from '../../common/config/configurable';
import FirebaseService from '../bootstrap/firebase-service';
import Auth = auth.Auth;

/**
 * AWS Cognito user management service
 */
@singleton()
export default class FirebaseIamService implements IamService, Configurable {
  private readonly requiredEnvironmentVariables: string[] = [];

  private readonly authConfig: FirebaseAuthConfig;

  private auth: Auth;

  constructor(@inject('CloudServiceBootstrap') private firebaseApp?: FirebaseService) {
    this.authConfig = FirebaseIamService.buildAuthConfig(process.env);
    if (!this.firebaseApp?.app) throw new Error('Firebase app not initialized');
    this.auth = getAuth(this.firebaseApp.app);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static buildAuthConfig(environment: typeof process.env): FirebaseAuthConfig {
    return {
      type: 'google',
    };
  }

  getRequiredEnvironmentVariables(): string[] {
    return this.requiredEnvironmentVariables;
  }

  getConfig(): {} {
    return { auth: this.authConfig };
  }

  /**
   * Register the user in Cognito
   * @param email
   */
  async createUser(email: string): Promise<void> {
    try {
      const user = await this.auth.createUser({
        email,
      });
      console.log(JSON.stringify(user));
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        throw new AccountExistsError();
      }
      throw error;
    }
  }

  /**
   * Verify a JWT token
   * @param token the JWT token
   */
  async verifyToken(token: string): Promise<AuthUser> {
    try {
      const decodedToken = await this.auth.verifyIdToken(token);
      if (decodedToken) {
        const userEmail = decodedToken.email as string;
        return {
          email: userEmail,
        };
      }
      throw new Error('Invalid token');
    } catch (e) {
      throw new ApiError('UNAUTHORIZED', 401, 'Bearer token not valid');
    }
  }
}
