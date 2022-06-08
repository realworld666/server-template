import { container } from 'tsyringe';
import FirebaseIamService from './firebase-iam-service';
import { IamService } from '../../common/iam/iam-service';
import { setupFirebase } from '../../../test-helper.spec';

describe('Firebase IAM Service', () => {
  let iamService: IamService;

  before(async () => {
    await setupFirebase();
    iamService = container.resolve<FirebaseIamService>(FirebaseIamService);
  });

  it('should create a new user', async () => {
    await iamService.createUser('test@test.com');
  });
});
