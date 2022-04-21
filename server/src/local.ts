import 'reflect-metadata';
import { config as configDotenv } from 'dotenv';
import { container } from 'tsyringe';
import { AppAuthConfig, Config, parseConfigFromEnvironment } from './app-config';
import { installServices } from './installer';
import AppInterface from './app-interface';

configDotenv();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const config = getLocalConfig();

installServices(config);

const app = container.resolve<AppInterface>('AppInterface');
app.start();
