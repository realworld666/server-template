export interface AppAuthConfig {
  type: string;
}

export type Config = {
  env?: string;
  selfTestKey?: string;
  selfTestUser?: string;
  validEmailMatch?: RegExp;
  caseSensitiveEmail?: boolean;
  showTestBanner: boolean;
  readonly?: boolean;
  fromAddress?: string;
  notificationToAddress?: string;
  [key: string]: any | undefined;
};
