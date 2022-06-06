import 'reflect-metadata';
import { config as configDotenv } from 'dotenv';
import { container, Lifecycle } from 'tsyringe';
import { installMockServices } from './installer';
import CloudServiceBootstrap from './services/common/bootstrap/cloud-service-bootstrap';
import FirebaseService from './services/google/bootstrap/firebase-service';
import FirebaseIamService from './services/google/auth/firebase-iam-service';
import FirestoreService from './services/google/database/firestore-service';

const axios = require('axios').default;

configDotenv();

before(async () => {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

  // Install our services

  installMockServices();

  const bootstrap = container.resolve<CloudServiceBootstrap>('CloudServiceBootstrap');
  await bootstrap.init();
});

function getProjectID(firebaseInstance: any): string {
  return (
    firebaseInstance.options.projectId ||
    (firebaseInstance.options.credential &&
      (firebaseInstance.options.credential as unknown as { projectId: string }).projectId) ||
    ''
  );
}

export async function setupFirebase() {
  container.register<FirebaseService>(
    'CloudServiceBootstrap',
    { useClass: FirebaseService },
    { lifecycle: Lifecycle.Singleton }
  );

  const bootstrap = container.resolve<FirebaseService>('CloudServiceBootstrap');
  await bootstrap.init();

  container.register<FirebaseIamService>('FirebaseIamService', FirebaseIamService);
  container.register<FirestoreService>('FirestoreService', FirestoreService);

  // flush the database
  const config = {
    headers: { Authorization: `Bearer owner` },
  };
  if (!bootstrap?.app?.options) throw new Error('Firebase app not initialized');

  await axios.delete(`http://localhost:9099/emulator/v1/projects/${getProjectID(bootstrap.app)}/accounts`, config);
  await axios.delete(
    `http://localhost:8080/emulator/v1/projects/${getProjectID(bootstrap.app)}/databases/(default)/documents`,
    config
  );
}
