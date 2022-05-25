import { injectable } from 'tsyringe';
import { ConfigResponse } from './models/config-response';
import AppConfigService from '../../services/common/config/app-config-service';

/**
 * Service to perform the config logic for config-controller
 */
@injectable()
export class ConfigService {
  constructor(private configService: AppConfigService) {}

  public getConfig(): ConfigResponse {
    const config = this.configService.getConfig();
    return {
      version: '2.1.0',
      showTestBanner: config.showTestBanner,
      auth: {
        type: config.auth.type,
        region: config.auth.region,
        userPoolId: config.auth.userPoolId,
        clientId: config.auth.clientId,
      },
      emailRegex: config.validEmailMatch?.source,
    };
  }
}
