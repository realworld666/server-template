import { container } from 'tsyringe';
import App from './app';
import { Config } from './app-config';
import IamService from './services/iam-service';
import AwsIamService from './services/aws/aws-iam-service';
import MockIamService from './services/mock/mock-iam-service';

/**
 * Install the current services for the app
 * @param config
 */
export function installServices(config: Config) {
  container.register('AppInterface', {
    useValue: new App({
      ...config,
      env: 'local',
    }),
  });

  if (config.authConfig.type === 'test') {
    // Configure the IAM service to use local mock
    container.register<IamService>('IamService', { useClass: MockIamService });
  } else {
    // Configure the IAM service to use AWS
    container.register<IamService>('IamService', { useClass: AwsIamService });
  }
  // Register the config, so we can inject this in other constructors
  container.register<Config>('Config', { useValue: config });
}

/**
 * As above but used by the unit tests so we should set up and global mock services here
 * @param config
 */
export function installMockServices(config: Config) {
  container.register('AppInterface', {
    useValue: new App({
      ...config,
      env: 'local',
    }),
  });

  container.register<IamService>('IamService', { useClass: MockIamService });
  container.register<Config>('Config', { useValue: config });
}
