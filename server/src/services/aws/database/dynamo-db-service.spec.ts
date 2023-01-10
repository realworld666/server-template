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

function generateRandomId() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 20; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

describe('Dynamo DB Service', () => {
  let dbService: DynamoDbService;

  function getTestObject(): TestObject {
    return {
      id: generateRandomId(),
      chatState: {
        state: 'step1',
        someBool: true,
      },
      nextAvailable: 123,
    };
  }

  before(async () => {
    // pre-test setup
    dbService = container.resolve(DynamoDbService);

    try {
      console.log('Creating table');
      await dbService.createTable('testTable', 'id', [
        {
          name: 'id',
          type: FieldType.String,
        },
      ]);
    } catch (e: any) {
      if (e.code !== 'ResourceInUseException') {
        throw e;
      }
      // this is fine, it just means the table already exists
    }

    expect(true).to.be.true;
  });

  it('should add something to the table', async () => {
    await dbService.insert('testTable', getTestObject());
  });

  it('should get something from the table', async () => {
    const testObject = getTestObject();
    await dbService.insert('testTable', testObject);
    const doc = await dbService.get<TestObject>('testTable', { id: testObject.id });
    expect(doc.id).to.eq(testObject.id);
  });
});
