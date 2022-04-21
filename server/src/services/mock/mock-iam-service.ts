import IamService from '../iam-service';
import { AuthUser } from '../../public-api/auth-user';

export default class MockIamService implements IamService {
  createUser(email: string): Promise<void> {
    console.log(email);
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyToken(token: string): Promise<AuthUser> {
    return Promise.resolve({ email: 'test@test.com' });
  }
}
