/**
 * Entry point for app engine deployment
 */

import 'reflect-metadata';
import { container } from 'tsyringe';
import { installServices } from './installer';
import AppInterface from './app-interface';
import CloudServiceBootstrap from './services/common/bootstrap/cloud-service-bootstrap';

installServices('google');

async function bootstrapAndRun() {
  const bootstrap = container.resolve<CloudServiceBootstrap>('CloudServiceBootstrap');
  await bootstrap.init();

  const app = container.resolve<AppInterface>('AppInterface');
  await app.start();
}

bootstrapAndRun().then(() => console.log('Bootstrap and run completed'));
