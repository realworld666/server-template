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
      // if the environment variable contains a JSON object, parse it
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS!.charAt(0) === '{') {
        this.app = admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS!)),
        });
        // else assume this contains a path
      } else {
        this.app = admin.initializeApp({
          credential: applicationDefault(),
        });
      }
      FirebaseService.initialized = true;
    } else {
      this.app = admin.app();
    }
  }
}
