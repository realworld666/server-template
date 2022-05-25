/* eslint-disable @typescript-eslint/dot-notation,@typescript-eslint/no-unused-expressions */
import 'reflect-metadata';
import { container } from 'tsyringe';
import chai, { expect } from 'chai';
import DynamoDbService from './dynamo-db-service';
import { FieldType } from '../../common/database/database-field-definition';

chai.use(require('chai-as-promised'));

interface TestObject {
  id: string;
  chatState: {
    state: string;
    someBool: boolean;
  };
  nextAvailable: number;
}

describe('Dynamo DB Service', () => {
  it('create a table', async () => {
    // the single test
    const dbService = container.resolve(DynamoDbService);

    try {
      await dbService.deleteTable('testTable');
    } catch {
      // this is fine
    }
    await dbService.createTable('testTable', 'id', [
      {
        name: 'id',
        type: FieldType.String,
      },
    ]);

    expect(true).to.be.true;
  });

  it('should add something to the table', async () => {
    const dbService = container.resolve(DynamoDbService);
    const testObject: TestObject = {
      id: 'someid',
      chatState: {
        state: 'step1',
        someBool: true,
      },
      nextAvailable: 123,
    };
    await dbService.insert('testTable', testObject);
  });

  it('should get something from the table', async () => {
    const dbService = container.resolve(DynamoDbService);
    const doc = await dbService.get<TestObject>('testTable', { id: 'someid' });
    expect(doc.id).to.eq('someid');
    expect;
  });
});
