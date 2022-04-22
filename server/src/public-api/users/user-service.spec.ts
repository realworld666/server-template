/* eslint-disable @typescript-eslint/dot-notation */
import 'reflect-metadata';
import { container } from 'tsyringe';
import { expect } from 'chai';
import UserService from './user-service';
import AppConfigService from '../../services/common/config/app-config-service';
import { MockAppConfigService } from '../../services/mock/config/mock-app-config-service';

describe('User Service', () => {
  it('create a new user', async () => {
    // the single test
    const userService = container.resolve(UserService);

    await userService.registerUser('test@test.com');
  });

  it('should normalise email', async () => {
    // the single test
    const userService = container.resolve(UserService);
    const configService = container.resolve(AppConfigService) as MockAppConfigService;

    const testEmail = 'Test@Test.com';

    configService.setPartialConfig({
      caseSensitiveEmail: true,
    });
    const caseSensitiveResult = userService['normaliseEmail'](testEmail);
    expect(caseSensitiveResult).to.eq(testEmail);

    configService.setPartialConfig({
      caseSensitiveEmail: false,
    });
    const caseInsensitiveResult = userService['normaliseEmail'](testEmail);
    expect(caseInsensitiveResult).to.eq(testEmail.toLowerCase());
  });
});
