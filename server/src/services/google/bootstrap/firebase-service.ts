import admin, { app, credential } from 'firebase-admin';
import { singleton } from 'tsyringe';
import CloudServiceBootstrap from '../../common/bootstrap/cloud-service-bootstrap';
import applicationDefault = credential.applicationDefault;

@singleton()
export default class FirebaseService implements CloudServiceBootstrap {
  public app: app.App | null = null;

  static initialized: boolean = false;

  async init(): Promise<void> {
    if (!FirebaseService.initialized) {
      this.app = admin.initializeApp({
        credential: applicationDefault(),
      });
      FirebaseService.initialized = true;
    } else {
      this.app = admin.app();
    }
  }
}
