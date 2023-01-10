import { StorageConfig } from '../../common/storage/storage-config';

export default interface S3Config extends StorageConfig {
  type: 's3';
  region: string;
}
