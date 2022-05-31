import 'reflect-metadata';
import { config as configDotenv } from 'dotenv';
import { container } from 'tsyringe';
import { installServices } from './installer';
import AppInterface from './app-interface';
import CloudServiceBootstrap from './services/common/bootstrap/cloud-service-bootstrap';

configDotenv();

installServices(process.env.ENV ?? 'test');

async function bootstrapAndRun() {
  const bootstrap = container.resolve<CloudServiceBootstrap>('CloudServiceBootstrap');
  await bootstrap.init();

  const app = container.resolve<AppInterface>('AppInterface');
  await app.start();
}

bootstrapAndRun().then(() => console.log('Bootstrap and run completed'));
