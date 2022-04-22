import { createServer, proxy } from 'aws-serverless-express';
import { container } from 'tsyringe';
import { installServices } from './installer';
import AppInterface from './app-interface';

installServices('cognito');

const { app } = container.resolve<AppInterface>('AppInterface');

const server = createServer(app);

const handler = (event: any, context: any) => {
  return proxy(server, event, context);
};

export default handler;
