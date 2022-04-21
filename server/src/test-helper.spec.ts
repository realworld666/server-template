import 'reflect-metadata';
import { config as configDotenv } from 'dotenv';
import { AppAuthConfig, Config, parseConfigFromEnvironment } from './app-config';
import { installMockServices } from './installer';

configDotenv();

const localAuthConfig: AppAuthConfig = {
  type: 'test',
  validate: (request: any) => {
    const bearerPrefix = 'basic ';
    const authorization = request.get('authorization');
    if (authorization === undefined) {
      return {};
    }
    if (!authorization.toLowerCase().startsWith(bearerPrefix)) {
      throw new Error('Malformed bearer prefix');
    }
    const token = authorization.slice(bearerPrefix.length);
    const decoded = Buffer.from(token, 'base64').toString();
    return { email: decoded.split(':')[0] };
  },
  users: [],
};

// Create the config object
const getLocalConfig = (): Config => {
  try {
    return parseConfigFromEnvironment(process.env);
  } catch (error: any) {
    console.log(`Env not configured correctly, falling back to stub setup.\n${error.message}`);
    return {
      showTestBanner: true,
      authConfig: localAuthConfig,
    };
  }
};

before(() => {
  const config = getLocalConfig();

  // Install our services
  installMockServices(config);
});
