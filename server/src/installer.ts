import { container } from 'tsyringe';
import IamService from './services/iam-service';
import AwsIamService from './services/aws/auth/aws-iam-service';
import MockIamService from './services/mock/auth/mock-iam-service';
import AppInterface from './app-interface';
import App from './app';
import AppConfigService from './services/common/config/app-config-service';
import { MockAppConfigService } from './services/mock/config/mock-app-config-service';

/**
 * Install the current services for the app
 */
export function installServices(type: string) {
  container.register<AppInterface>('AppInterface', { useClass: App });
  switch (type) {
    case 'test': {
      // Configure the IAM service to use local mock
      container.register<IamService>('IamService', { useClass: MockIamService });
      break;
    }
    case 'cognito': {
      // Configure the IAM service to use AWS
      container.register<IamService>('IamService', { useClass: AwsIamService });
      break;
    }
    default: {
      throw new Error(`Unsupported install type ${type}`);
    }
  }
}

/**
 * As above but used by the unit tests so we should set up and global mock services here
 */
export function installMockServices() {
  container.register<AppInterface>('AppInterface', { useClass: App });
  container.register<AppConfigService>(AppConfigService, { useClass: MockAppConfigService });
  container.register<IamService>('IamService', { useClass: MockIamService });
}
