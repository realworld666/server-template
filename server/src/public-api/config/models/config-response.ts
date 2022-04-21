export interface ConfigResponse {
  version: string;
  showTestBanner: boolean;
  auth: {
    type: string;
    region?: string;
    userPoolId?: string;
    webClientId?: string;
  };
  emailRegex?: string;
}
