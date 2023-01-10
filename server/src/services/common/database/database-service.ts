import { DatabaseFieldDefinition } from './database-field-definition';

export interface DatabaseService {
  createTable(tableName: string, primaryKey: string, fields: DatabaseFieldDefinition[]): Promise<void>;

  deleteTable(tableName: string): Promise<void>;

  insert<T>(tableName: string, objectToInsert: T): Promise<string | null>;

  get<T>(tableName: string, key: { [key: string]: any }): Promise<T>;

  update<T>(tableName: string, key: { [key: string]: any }, partialObject: Partial<T>): Promise<void>;

  delete(tableName: string, key: { [key: string]: any }): Promise<void>;

  insertWithId<T>(collectionPath: string, key: { [key: string]: any }, objectToInsert: T): Promise<void>;
}
