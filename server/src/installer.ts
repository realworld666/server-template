import { container, Lifecycle } from 'tsyringe';
import AwsIamService from './services/aws/auth/aws-iam-service';
import MockIamService from './services/mock/auth/mock-iam-service';
import AppInterface from './app-interface';
import App from './app';
import AppConfigService from './services/common/config/app-config-service';
import { MockAppConfigService } from './services/mock/config/mock-app-config-service';
import DynamoDbService from './services/aws/database/dynamo-db-service';
import MockDatabaseService from './services/mock/database/mock-database-service';
import { Configurable } from './services/common/config/configurable';

function registerConfigurable<T extends Configurable>(Service: { new (): T }, token: string) {
  const value = new Service();
  container.register<Configurable>('Configurable', { useValue: value });
  container.register<T>(token, { useValue: value });
}

/**
 * Install the current services for the app
 */
export function installServices(type: string) {
  container.register<AppInterface>('AppInterface', { useClass: App }, { lifecycle: Lifecycle.Singleton });
  switch (type) {
    case 'test': {
      // Configure the IAM service to use local mock
      registerConfigurable(MockIamService, 'IamService');
      registerConfigurable(MockDatabaseService, 'DatabaseService');
      break;
    }
    case 'aws': {
      // Install the aws services
      registerConfigurable(AwsIamService, 'IamService');
      registerConfigurable(DynamoDbService, 'DatabaseService');
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
  container.register<AppInterface>('AppInterface', { useClass: App }, { lifecycle: Lifecycle.Singleton });
  container.register<AppConfigService>(
    AppConfigService,
    { useClass: MockAppConfigService },
    { lifecycle: Lifecycle.Singleton }
  );
  registerConfigurable(MockIamService, 'IamService');
  registerConfigurable(MockDatabaseService, 'DatabaseService');
}
