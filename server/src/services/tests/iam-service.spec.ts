import { container, InjectionToken } from 'tsyringe';
import chai, { expect } from 'chai';

import { setupAws, setupFirebase } from '../../test-helper.spec';
import { AccountExistsError, IamService } from '../common/iam/iam-service';
import FirebaseIamService from '../google/auth/firebase-iam-service';
import MockIamService from '../mock/auth/mock-iam-service';

chai.use(require('chai-as-promised'));

describe('Firebase IAM Service', () => {
  let iamService: IamService;

  const services: { name: string; token: InjectionToken<IamService>; setupFn: () => void }[] = [
    {
      name: 'firebase',
      token: FirebaseIamService,
      setupFn: setupFirebase,
    },
    {
      name: 'aws',
      token: MockIamService, // there is no emulator for AWS cognito so we need to use the mock
      setupFn: setupAws,
    },
  ];

  it('should create a new user', async () => {
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      service.setupFn();
      iamService = container.resolve<IamService>(service.token);
      try {
        // eslint-disable-next-line no-await-in-loop
        await iamService.createUser('test@test.com');
      } catch (e) {
        expect(true).to.be.false(`Could not create a user for service ${service.name}`);
      }
    }
  });

  it('should fail to create a duplicate user', async () => {
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      service.setupFn();
      iamService = container.resolve<IamService>(service.token);
      // eslint-disable-next-line no-await-in-loop
      await iamService.createUser('test@test.com');
      // eslint-disable-next-line no-await-in-loop
      await expect(iamService.createUser('test@test.com')).to.be.rejectedWith(
        AccountExistsError,
        '',
        `Service ${service.name} failed to throw AccountExistsError`
      );
    }
  });
});
