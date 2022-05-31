import { DatabaseConfig } from '../../common/database/database-config';

export interface FirestoreConfig extends DatabaseConfig {
  type: 'firestore';
}
