import 'reflect-metadata';
import { config as configDotenv } from 'dotenv';
import { installMockServices } from './installer';

configDotenv();

before(() => {
  // Install our services
  installMockServices();
});
