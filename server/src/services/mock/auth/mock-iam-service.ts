import { AccountExistsError, IamService } from '../../common/iam/iam-service';
import { AuthUser } from '../../../public-api/auth-user';
import { Configurable } from '../../common/config/configurable';

export default class MockIamService implements IamService, Configurable {
  private createdUsers: { [key: string]: boolean } = {};

  // eslint-disable-next-line class-methods-use-this
  createUser(email: string): Promise<void> {
    if (Object.prototype.hasOwnProperty.call(this.createdUsers, email)) throw new AccountExistsError();
    this.createdUsers[email] = true;
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  verifyToken(token: string): Promise<AuthUser> {
    return Promise.resolve({ email: 'test@test.com' });
  }

  // eslint-disable-next-line class-methods-use-this
  getRequiredEnvironmentVariables(): string[] {
    return [];
  }

  getConfig(): {} {
    return {
      auth: {
        type: 'test',
      },
    };
  }
}
