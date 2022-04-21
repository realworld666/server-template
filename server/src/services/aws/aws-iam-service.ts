import { inject, singleton } from 'tsyringe';
import AWS, { CognitoIdentityServiceProvider } from 'aws-sdk';
import IamService from '../iam-service';
import ApiError from '../../api-error';

import { CognitoAuthConfig, Config } from '../../app-config';
import { validate } from './cognito';
import { AuthUser } from '../../public-api/auth-user';

/**
 * AWS Cognito user management service
 */
@singleton()
export default class AwsIamService implements IamService {
  private cognito: CognitoIdentityServiceProvider;

  private authConfig: CognitoAuthConfig;

  constructor(@inject('Config') private config: Config) {
    if (!this.config) {
      throw new ApiError('NO_CONFIG', 502, 'Config is not defined');
    }

    // Ensure the config is correct for this service
    if (this.config.authConfig.type !== 'cognito') {
      throw new ApiError('BAD_CONFIG', 502, `Config is ${this.config.authConfig.type} but we're injecting the AWS IAM`);
    }

    this.authConfig = this.config.authConfig as CognitoAuthConfig;

    AWS.config.update({ region: this.authConfig.region });
    this.cognito = new CognitoIdentityServiceProvider();
  }

  /**
   * Register the user in Cognito
   * @param email
   */
  async createUser(email: string): Promise<void> {
    await this.cognito
      .adminCreateUser({
        UserPoolId: this.authConfig.cognitoUserPoolId,
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
        userPoolId: this.authConfig.cognitoUserPoolId,
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
