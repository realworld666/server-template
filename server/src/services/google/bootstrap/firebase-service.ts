import admin, { app, credential } from 'firebase-admin';
import CloudServiceBootstrap from '../../common/bootstrap/cloud-service-bootstrap';
import applicationDefault = credential.applicationDefault;
import { singleton } from 'tsyringe';

@singleton()
export default class FirebaseService implements CloudServiceBootstrap {
  public app: app.App | null = null;

  async init(): Promise<void> {
    this.app = admin.initializeApp({
      credential: applicationDefault(),
    });
  }
}
