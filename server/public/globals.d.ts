// noinspection ES6ConvertVarToLetConst

import { CognitoUser } from 'amazon-cognito-identity-js';

declare global {
  var loggedInUser: CognitoUser | undefined;
}
