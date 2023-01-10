import { autoInjectable, singleton } from 'tsyringe';
import AWS from 'aws-sdk';
import StorageService from '../../common/storage/storage-service';
import { Configurable } from '../../common/config/configurable';
import S3Config from './s3-config';

@singleton()
@autoInjectable()
export default class S3Service implements StorageService, Configurable {
  private readonly requiredEnvironmentVariables: string[] = ['REGION'];

  private storageConfig: S3Config;

  private s3: AWS.S3;

  constructor() {
    this.storageConfig = S3Service.buildStorageConfig(process.env);
    this.s3 = new AWS.S3();
  }

  getRequiredEnvironmentVariables(): string[] {
    return this.requiredEnvironmentVariables;
  }

  private static buildStorageConfig(env: typeof process.env): S3Config {
    return {
      type: 's3',
      region: env.REGION!,
    };
  }

  getConfig(): {} {
    return this.storageConfig;
  }

  getPublicUrlForKey(bucket: string, key: string): string {
    return `https://${bucket}.s3.${this.storageConfig.region}.amazonaws.com/${key}`;
  }

  getSignedUrlForKey(bucket: string, key: string): string {
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: 60,
    };
    return this.s3.getSignedUrl('getObject', params);
  }
}
