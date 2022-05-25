import { DatabaseFieldDefinition } from './database-field-definition';

export interface DatabaseService {
  createTable(tableName: string, primaryKey: string, fields: DatabaseFieldDefinition[]): Promise<void>;

  deleteTable(tableName: string): Promise<void>;

  insert<T>(tableName: string, objectToInsert: T): Promise<void>;

  get<T>(tableName: string, key: { [key: string]: any }): Promise<T>;

  update(tableName: string, key: { [key: string]: any }, partialObject: any): Promise<void>;

  delete(tableName: string, key: { [key: string]: any }): Promise<void>;
}
