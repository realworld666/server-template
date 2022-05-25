import { inject, injectAll, singleton } from 'tsyringe';
import AppConfigService from '../../common/config/app-config-service';
import { Config } from '../../common/config/app-config';
import { Configurable } from '../../common/config/configurable';
import IamService from '../../common/iam/iam-service';

@singleton()
export class MockAppConfigService extends AppConfigService {
  constructor(@inject('IamService') iamService: IamService, @injectAll('Configurable') configurables: Configurable[]) {
    MockAppConfigService.mockEnvironmentVariable('COGNITO_USER_POOL_ID');
    MockAppConfigService.mockEnvironmentVariable('COGNITO_CLIENT_ID');
    MockAppConfigService.mockEnvironmentVariable('REGION');
    super(iamService, configurables);
  }

  static mockEnvironmentVariable(key: string) {
    process.env[key] = process.env[key] ?? 'mock';
  }

  public setConfig(config: Config) {
    this.config = config;
  }

  public setPartialConfig(config: any) {
    this.config = { ...this.config, ...config };
  }
}
