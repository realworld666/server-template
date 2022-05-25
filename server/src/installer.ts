import { container, Lifecycle } from 'tsyringe';
import IamService from './services/common/iam/iam-service';
import AwsIamService from './services/aws/auth/aws-iam-service';
import MockIamService from './services/mock/auth/mock-iam-service';
import AppInterface from './app-interface';
import App from './app';
import AppConfigService from './services/common/config/app-config-service';
import { MockAppConfigService } from './services/mock/config/mock-app-config-service';
import { DatabaseService } from './services/common/database/database-service';
import DynamoDbService from './services/aws/database/dynamo-db-service';
import MockDatabaseService from './services/mock/database/mock-database-service';

/**
 * Install the current services for the app
 */
export function installServices(type: string) {
  container.register<AppInterface>('AppInterface', { useClass: App }, { lifecycle: Lifecycle.Singleton });
  switch (type) {
    case 'test': {
      // Configure the IAM service to use local mock
      container.register<IamService>('IamService', { useClass: MockIamService }, { lifecycle: Lifecycle.Singleton });
      break;
    }
    case 'aws': {
      // Install the aws services
      container.register<IamService>('IamService', { useClass: AwsIamService }, { lifecycle: Lifecycle.Singleton });
      container.register<DatabaseService>(
        'DatabaseService',
        { useClass: DynamoDbService },
        { lifecycle: Lifecycle.Singleton }
      );
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
  container.register<IamService>('IamService', { useClass: MockIamService }, { lifecycle: Lifecycle.Singleton });
  container.register<DatabaseService>(
    'DatabaseService',
    { useClass: MockDatabaseService },
    { lifecycle: Lifecycle.Singleton }
  );
}
