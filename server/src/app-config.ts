import { Request } from 'express';
import { UserType } from 'aws-sdk/clients/cognitoidentityserviceprovider';

type TestAuthConfig = {
  type: 'test';
  validate: (request: Request) => any;
  users: UserType[];
};

export type CognitoAuthConfig = {
  type: 'cognito';
  cognitoUserPoolId: string;
  cognitoClientId: string;
  region: string;
};

export type AppAuthConfig = CognitoAuthConfig | TestAuthConfig;

export type Config = {
  authConfig: AppAuthConfig;
  env?: string;
  selfTestKey?: string;
  selfTestUser?: string;
  validEmailMatch?: RegExp;
  caseSensitiveEmail?: boolean;
  showTestBanner: boolean;
  readonly?: boolean;
  fromAddress?: string;
  notificationToAddress?: string;
};

/** Source: https://emailregex.com/ */
const emailRegex =
  // eslint-disable-next-line no-control-regex
  /^(?:[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*|"(?:[\u0001-\u0008\u000B\u000C\u000E-\u001F!\u0023-\u005B\u005D-\u007F]|\\[\u0001-\u0009\u000B\u000C\u000E-\u007F])*")@(?:(?:[\da-z](?:[\da-z-]*[\da-z])?\.)+[\da-z](?:[\da-z-]*[\da-z])?|\[(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2}|[\da-z-]*[\da-z]:(?:[\u0001-\u0008\u000B\u000C\u000E-\u001F\u0021-\u007F]|\\[\u0001-\u0009\u000B\u000C\u000E-\u007F])+)])$/i;
export const isValidEmail = (email: string): boolean => emailRegex.test(email);

export function parseConfigFromEnvironment(environment: typeof process.env): Config {
  const {
    REGION,
    COGNITO_USER_POOL_ID,
    EMAIL_REGEX,
    COGNITO_CLIENT_ID,
    ENV,
    SHOW_TEST_BANNER,
    READONLY,
    FROM_ADDRESS,
  } = environment;

  const requiredEnvironment = {
    REGION,
    COGNITO_USER_POOL_ID,
    EMAIL_REGEX,
    COGNITO_CLIENT_ID,
  };

  if (
    REGION === undefined ||
    COGNITO_USER_POOL_ID === undefined ||
    EMAIL_REGEX === undefined ||
    COGNITO_CLIENT_ID === undefined
  ) {
    const missingEnvironmentVariables = Object.entries(requiredEnvironment)
      .filter(([, value]) => value === undefined)
      .map(([environmentVariable]) => environmentVariable);

    throw new Error(`Missing required env parameters: ${missingEnvironmentVariables.join(', ')}`);
  }

  return {
    authConfig: {
      type: 'cognito',
      cognitoUserPoolId: COGNITO_USER_POOL_ID,
      cognitoClientId: COGNITO_CLIENT_ID,
      region: REGION,
    },
    env: ENV,
    validEmailMatch: EMAIL_REGEX ? new RegExp(EMAIL_REGEX) : undefined,
    showTestBanner: SHOW_TEST_BANNER === 'true',
    readonly: READONLY === 'true',
    fromAddress: FROM_ADDRESS,
  };
}
