import { autoInjectable, inject, singleton } from 'tsyringe';
import { getFirestore } from 'firebase-admin/firestore';
import { FirestoreConfig } from './firestore-config';
import { DatabaseFieldDefinition } from '../../common/database/database-field-definition';
import { DatabaseService } from '../../common/database/database-service';
import { Configurable } from '../../common/config/configurable';
import FirebaseService from '../bootstrap/firebase-service';

@singleton()
@autoInjectable()
export default class FirestoreService implements DatabaseService, Configurable {
  readonly requiredEnvironmentVariables: string[] = [];

  private readonly dbConfig: FirestoreConfig;

  private firestore: FirebaseFirestore.Firestore;

  constructor(@inject('CloudServiceBootstrap') private firebaseApp?: FirebaseService) {
    this.dbConfig = FirestoreService.buildDatabaseConfig(process.env);

    if (!this.firebaseApp?.app) throw new Error('Firebase app not initialized');
    this.firestore = getFirestore(this.firebaseApp.app);
  }

  getRequiredEnvironmentVariables(): string[] {
    return this.requiredEnvironmentVariables;
  }

  getConfig(): {} {
    return {
      db: this.dbConfig,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createTable(tableName: string, primaryKey: string, fields: DatabaseFieldDefinition[]) {
    // Not required. Firestore will create the collection as we add data
  }

  async deleteTable(collectionPath: string) {
    const collectionRef = this.firestore.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(100);

    await this.deleteQueryBatch(query);
  }

  private async deleteQueryBatch(query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
      return;
    }

    // Delete documents in a batch
    const batch = this.firestore.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      this.deleteQueryBatch(query);
    });
  }

  async insert<T>(collectionPath: string, objectToInsert: T): Promise<string | null> {
    const result = await this.firestore.collection(collectionPath).add(objectToInsert);
    return result.id;
  }

  async insertWithId<T>(collectionPath: string, key: { [key: string]: any }, objectToInsert: T): Promise<void> {
    await this.firestore.collection(collectionPath).doc(key.id).set(objectToInsert);
  }

  async update(collectionPath: string, key: { [key: string]: any }, partialObject: any) {
    const docRef = this.firestore.collection(collectionPath).doc(key.id);
    await docRef.update(partialObject);
  }

  async get<T>(collectionPath: string, key: { [key: string]: any }): Promise<T> {
    const docRef = this.firestore.collection(collectionPath).doc(key.id);
    const docSnapshot = await docRef.get();
    return docSnapshot.data() as T;
  }

  /**
   * WARNING: Deleting a document does not delete its subcollections.
   * @param collectionPath The path to the document to delete
   * @param key The key of the document to delete
   */
  async delete(collectionPath: string, key: { [key: string]: any }) {
    await this.firestore.collection(collectionPath).doc(key.id).delete();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static buildDatabaseConfig(environment: typeof process.env): FirestoreConfig {
    return {
      tablePrefix: '',
      type: 'firestore',
    };
  }
}
