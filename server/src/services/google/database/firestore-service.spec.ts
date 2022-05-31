/* eslint-disable @typescript-eslint/dot-notation,@typescript-eslint/no-unused-expressions */
import 'reflect-metadata';
import { container } from 'tsyringe';
import chai, { expect } from 'chai';
import { FieldType } from '../../common/database/database-field-definition';
import AppConfigService from '../../common/config/app-config-service';
import { MockAppConfigService } from '../../mock/config/mock-app-config-service';
import { DatabaseService } from '../../common/database/database-service';
import { setupFirebase } from '../../../test-helper.spec';
import FirestoreService from './firestore-service';

chai.use(require('chai-as-promised'));

interface TestObject {
  id: string;
  chatState: {
    state: string;
    someBool: boolean;
  };
  nextAvailable: number;
}

describe('Firestore Service', () => {
  let dbService: DatabaseService;
  before(async () => {
    await setupFirebase();
    dbService = container.resolve<FirestoreService>('FirestoreService');
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
    await dbService.insertWithId('testTable', { id: 'someid' }, testObject);
  });

  it('should get something from the table', async () => {
    const doc = await dbService.get<TestObject>('testTable', { id: 'someid' });
    expect(doc.id).to.eq('someid');
    expect;
  });
});
