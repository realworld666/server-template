/* eslint-disable @typescript-eslint/no-unused-expressions */
import { container } from 'tsyringe';
import { expect } from 'chai';
import MockIamService from './services/mock/auth/mock-iam-service';
import { IamService } from './services/common/iam/iam-service';
import { Configurable } from './services/common/config/configurable';

describe('Injection Tests', () => {
  it('should return the same object', async () => {
    const iamService = container.resolve<IamService>('IamService');
    const configurables = container.resolveAll<Configurable>('Configurable');

    let foundConfigurable = false;
    expect(iamService).to.be.instanceof(MockIamService);
    // @ts-ignore
    iamService.test = 'test';
    for (let i = 0; i < configurables.length; i++) {
      if (configurables[i] instanceof MockIamService) {
        foundConfigurable = true;
        // @ts-ignore
        expect(configurables[i].test).to.eq(
          'test',
          'Configurable and IamService are different instances of the same object'
        );
      }
    }
    expect(foundConfigurable).to.be.true;
  });
});
