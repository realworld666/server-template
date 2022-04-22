import { AppAuthConfig } from '../../common/config/app-config';

export interface CognitoAuthConfig extends AppAuthConfig {
  type: 'cognito';
  userPoolId: string;
  clientId: string;
  region: string;
}
