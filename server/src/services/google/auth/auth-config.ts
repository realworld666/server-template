import { AppAuthConfig } from '../../common/config/app-config';

export interface FirebaseAuthConfig extends AppAuthConfig {
  type: 'google';
}
