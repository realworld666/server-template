import { Controller, Get, Route, Tags } from 'tsoa';
import { autoInjectable } from 'tsyringe';
import { ConfigService } from './config-service';
import { ConfigResponse } from './models/config-response';
import ApiError from '../../api-error';

/**
 * Controller to return the configuration data for the deployed server
 */
@Route('config')
@Tags('Config Controller')
@autoInjectable()
export class ConfigController extends Controller {
  constructor(private configService?: ConfigService) {
    super();
  }

  @Get()
  public async getConfig(): Promise<ConfigResponse> {
    const config = this.configService?.getConfig();
    if (!config) throw new ApiError('NO_CONFIG', 500, 'Could  not get a config');
    return config;
  }
}
