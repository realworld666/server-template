/* eslint-disable class-methods-use-this,@typescript-eslint/no-unused-vars */
import { DatabaseService } from '../../common/database/database-service';
import { DatabaseFieldDefinition } from '../../common/database/database-field-definition';
import { Configurable } from '../../common/config/configurable';

export default class MockDatabaseService implements DatabaseService, Configurable {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createTable(tableName: string, primaryKey: string, fields: DatabaseFieldDefinition[]): Promise<void> {
    return Promise.resolve(undefined);
  }

  getConfig(): {} {
    return { db: { type: 'test' } };
  }

  getRequiredEnvironmentVariables(): string[] {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  deleteTable(tableName: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  delete(tableName: string, key: { [p: string]: any }): Promise<void> {
    return Promise.resolve(undefined);
  }

  get<T>(tableName: string, key: { [p: string]: any }): Promise<T> {
    // @ts-ignore
    return Promise.resolve(key);
  }

  insert<T>(tableName: string, objectToInsert: T): Promise<string> {
    return Promise.resolve('');
  }

  insertWithId<T>(collectionPath: string, key: { [key: string]: any }, objectToInsert: T): Promise<void> {
    return Promise.resolve(undefined);
  }

  update(tableName: string, key: { [p: string]: any }, partialObject: any): Promise<void> {
    return Promise.resolve(undefined);
  }
}
