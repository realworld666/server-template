/* eslint-disable @typescript-eslint/dot-notation,@typescript-eslint/no-unused-expressions */
import 'reflect-metadata';
import { container } from 'tsyringe';
import chai, { expect } from 'chai';
import { FieldType } from '../../common/database/database-field-definition';
import AppConfigService from '../../common/config/app-config-service';
import { MockAppConfigService } from '../../mock/config/mock-app-config-service';
import { DatabaseService } from '../../common/database/database-service';

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
  let configService: MockAppConfigService;
  let dbService: DatabaseService;
  before(() => {
    configService = container.resolve(AppConfigService) as MockAppConfigService;
    configService.setPartialConfig({
      region: 'eu-west-1',
    });

    dbService = container.resolve<DatabaseService>('DatabaseService');
  });
  it('create a table', async () => {
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
    const doc = await dbService.get<TestObject>('testTable', { id: 'someid' });
    expect(doc.id).to.eq('someid');
    expect;
  });
});
