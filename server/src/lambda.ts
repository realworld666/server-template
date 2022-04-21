import { createServer, proxy } from 'aws-serverless-express';
import { container } from 'tsyringe';
import { parseConfigFromEnvironment } from './app-config';
import { installServices } from './installer';
import AppInterface from './app-interface';

const config = parseConfigFromEnvironment(process.env);

installServices(config);

const { app } = container.resolve<AppInterface>('AppInterface');

const server = createServer(app);

const handler = (event: any, context: any) => {
  return proxy(server, event, context);
};

export default handler;
