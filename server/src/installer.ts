import { container, instanceCachingFactory, Lifecycle } from 'tsyringe';
import AwsIamService from './services/aws/auth/aws-iam-service';
import MockIamService from './services/mock/auth/mock-iam-service';
import AppInterface from './app-interface';
import App from './app';
import AppConfigService from './services/common/config/app-config-service';
import { MockAppConfigService } from './services/mock/config/mock-app-config-service';
import DynamoDbService from './services/aws/database/dynamo-db-service';
import MockDatabaseService from './services/mock/database/mock-database-service';
import { Configurable } from './services/common/config/configurable';
import { AwsService } from './services/aws/bootstrap/aws-service';
import MockBootstrapService from './services/mock/bootstrap/mock-bootstrap-service';
import FirebaseService from './services/google/bootstrap/firebase-service';
import FirebaseIamService from './services/google/auth/firebase-iam-service';
import FirestoreService from './services/google/database/firestore-service';

function registerConfigurable<T extends Configurable>(Service: { new (): T }, token: string) {
  const cachingFactory = instanceCachingFactory<T>((c) => c.resolve(Service));
  container.register<Configurable>('Configurable', {
    useFactory: cachingFactory,
  });
  container.register<T>(token, { useFactory: cachingFactory });
}

/**
 * Install the current services for the app
 */
export function installServices(type: string) {
  container.register<AppInterface>('AppInterface', { useClass: App }, { lifecycle: Lifecycle.Singleton });
  switch (type) {
    case 'test': {
      // Configure the IAM service to use local mock
      container.register<MockBootstrapService>(
        'CloudServiceBootstrap',
        { useClass: MockBootstrapService },
        { lifecycle: Lifecycle.Singleton }
      );
      registerConfigurable(MockIamService, 'IamService');
      registerConfigurable(MockDatabaseService, 'DatabaseService');
      break;
    }
    case 'aws': {
      // Install the aws services
      container.register<AwsService>(
        'CloudServiceBootstrap',
        { useClass: AwsService },
        { lifecycle: Lifecycle.Singleton }
      );
      registerConfigurable(AwsIamService, 'IamService');
      registerConfigurable(DynamoDbService, 'DatabaseService');
      break;
    }
    case 'google': {
      // Install the aws services
      container.register<FirebaseService>(
        'CloudServiceBootstrap',
        { useClass: FirebaseService },
        { lifecycle: Lifecycle.Singleton }
      );
      registerConfigurable(FirebaseIamService, 'IamService');
      registerConfigurable(FirestoreService, 'DatabaseService');
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
  container.register<MockBootstrapService>(
    'CloudServiceBootstrap',
    { useClass: MockBootstrapService },
    { lifecycle: Lifecycle.Singleton }
  );
  registerConfigurable(MockIamService, 'IamService');
  registerConfigurable(MockDatabaseService, 'DatabaseService');
}
