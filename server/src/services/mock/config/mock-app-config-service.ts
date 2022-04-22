import { singleton } from 'tsyringe';
import AppConfigService from '../../common/config/app-config-service';
import { Config } from '../../common/config/app-config';

@singleton()
export class MockAppConfigService extends AppConfigService {
  public setConfig(config: Config) {
    this.config = config;
  }

  public setPartialConfig(config: any) {
    this.config = { ...this.config, ...config };
  }
}
