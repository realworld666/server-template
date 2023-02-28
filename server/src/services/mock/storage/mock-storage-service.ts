import { Configurable } from '../../common/config/configurable';
import StorageService from '../../common/storage/storage-service';

export default class MockStorageService implements StorageService, Configurable {
  getRequiredEnvironmentVariables(): string[] {
    return [];
  }

  getConfig(): {} {
    return { db: { type: 'test' } };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPublicUrlForKey(bucket: string, key: string): string {
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSignedUrlForKey(bucket: string, key: string): string {
    return '';
  }
}
