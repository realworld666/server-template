import { Configurable } from '../../common/config/configurable';
import StorageService from '../../common/storage/storage-service';

export default class MockStorageService implements StorageService, Configurable {
  getRequiredEnvironmentVariables(): string[] {
    return [];
  }

  getConfig(): {} {
    return { db: { type: 'test' } };
  }
}
