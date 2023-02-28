export default interface StorageService {
  getPublicUrlForKey(bucket: string, key: string): string;

  getSignedUrlForKey(bucket: string, key: string): string;
}
