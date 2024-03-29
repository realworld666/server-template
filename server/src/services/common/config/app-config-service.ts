import { autoInjectable, injectAll, singleton } from 'tsyringe';
import { Config } from './app-config';
import { Configurable } from './configurable';

@singleton()
@autoInjectable()
export default class AppConfigService {
  private readonly requiredEnvironmentVariables: string[] = [];

  protected config: Config | undefined = undefined;

  constructor(@injectAll('Configurable') private configurables: Configurable[]) {
    this.buildConfig(process.env);
  }

  private buildConfig(environment: typeof process.env) {
    let requiredEnvironment: string[] = this.requiredEnvironmentVariables;
    this.configurables.forEach((c) => {
      requiredEnvironment = requiredEnvironment.concat(c.getRequiredEnvironmentVariables());
    });

    const missingEnvironmentVariables = requiredEnvironment.filter((value) => environment[value] === undefined);
    if (missingEnvironmentVariables?.length > 0) {
      throw new Error(`Missing required env parameters: ${missingEnvironmentVariables.join(', ')}`);
    }

    this.config = {
      env: environment.ENV,
      validEmailMatch: environment.EMAIL_REGEX ? new RegExp(environment.EMAIL_REGEX) : undefined,
      showTestBanner: environment.SHOW_TEST_BANNER === 'true',
      readonly: environment.READONLY === 'true',
      fromAddress: environment.FROM_ADDRESS,
      ...this.configurables.map((c) => c.getConfig()).reduce((result, current) => Object.assign(result, current), {}),
    };
  }

  public isValidEmail(email: string): boolean {
    /** Source: https://emailregex.com/ */
    const emailRegex =
      // eslint-disable-next-line no-control-regex
      /^(?:[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*|"(?:[\u0001-\u0008\u000B\u000C\u000E-\u001F!\u0023-\u005B\u005D-\u007F]|\\[\u0001-\u0009\u000B\u000C\u000E-\u007F])*")@(?:(?:[\da-z](?:[\da-z-]*[\da-z])?\.)+[\da-z](?:[\da-z-]*[\da-z])?|\[(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2}|[\da-z-]*[\da-z]:(?:[\u0001-\u0008\u000B\u000C\u000E-\u001F\u0021-\u007F]|\\[\u0001-\u0009\u000B\u000C\u000E-\u007F])+)])$/i;
    return emailRegex.test(email);
  }

  public getConfig(): Config {
    if (!this.config) throw new Error('Config is being accessed but is still undefined');
    return this.config;
  }
}
