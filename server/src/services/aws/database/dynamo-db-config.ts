import { DatabaseConfig } from '../../common/database/database-config';

export interface DynamoDbConfig extends DatabaseConfig {
  type: 'dynamodb';
  region: string;
  endpoint?: string;
}
