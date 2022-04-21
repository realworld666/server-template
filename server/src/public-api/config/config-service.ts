import { inject, injectable } from 'tsyringe';
import AppInterface from '../../app-interface';
import { ConfigResponse } from './models/config-response';

/**
 * Service to perform the config logic for config-controller
 */
@injectable()
export class ConfigService {
  constructor(@inject('AppInterface') private app: AppInterface) {}

  public getConfig(): ConfigResponse {
    const { config } = this.app;
    return {
      version: '2.1.0',
      showTestBanner: config.showTestBanner,
      auth:
        config.authConfig.type === 'cognito'
          ? {
              type: 'cognito',
              region: config.authConfig.region,
              userPoolId: config.authConfig.cognitoUserPoolId,
              webClientId: config.authConfig.cognitoClientId,
            }
          : { type: 'test' },
      emailRegex: config.validEmailMatch?.source,
    };
  }
}
