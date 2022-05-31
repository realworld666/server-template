import { singleton } from 'tsyringe';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import IamService from '../../common/iam/iam-service';
import ApiError from '../../../api-error';

import { validate } from './cognito';
import { AuthUser } from '../../../public-api/auth-user';
import { CognitoAuthConfig } from './auth-config';
import { Configurable } from '../../common/config/configurable';

/**
 * AWS Cognito user management service
 */
@singleton()
export default class AwsIamService implements IamService, Configurable {
  private readonly requiredEnvironmentVariables: string[] = ['COGNITO_USER_POOL_ID', 'COGNITO_CLIENT_ID', 'REGION'];

  private readonly authConfig: CognitoAuthConfig;

  private cognito: CognitoIdentityServiceProvider;

  constructor() {
    this.authConfig = AwsIamService.buildAuthConfig(process.env);

    this.cognito = new CognitoIdentityServiceProvider();
  }

  private static buildAuthConfig(environment: typeof process.env): CognitoAuthConfig {
    return {
      type: 'cognito',
      userPoolId: environment.COGNITO_USER_POOL_ID!,
      clientId: environment.COGNITO_CLIENT_ID!,
      region: environment.REGION!,
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
    await this.cognito
      .adminCreateUser({
        UserPoolId: this.authConfig.userPoolId,
        Username: email,
        MessageAction: 'SUPPRESS',
      })
      .promise();
  }

  /**
   * Verify a JWT token
   * @param token the JWT token
   */
  async verifyToken(token: string): Promise<AuthUser> {
    const authResult = await validate(
      {
        region: this.authConfig.region,
        userPoolId: this.authConfig.userPoolId,
        tokenUse: 'id',
      },
      token
    );

    if (authResult.valid) {
      const userEmail = authResult.token.email as string;
      return {
        email: userEmail,
      };
    }

    throw new ApiError('UNAUTHORIZED', 401, 'Bearer token not valid');
  }
}
