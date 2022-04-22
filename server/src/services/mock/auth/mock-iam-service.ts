import IamService from '../../iam-service';
import { AuthUser } from '../../../public-api/auth-user';
import { AppAuthConfig } from '../../common/config/app-config';

export default class MockIamService implements IamService {
  // eslint-disable-next-line class-methods-use-this
  createUser(email: string): Promise<void> {
    console.log(email);
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  verifyToken(token: string): Promise<AuthUser> {
    return Promise.resolve({ email: 'test@test.com' });
  }

  // eslint-disable-next-line class-methods-use-this
  getAuthConfig(): AppAuthConfig {
    return {
      type: 'test',
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getRequiredEnvironmentVariables(): string[] {
    return [];
  }
}
