import 'reflect-metadata';
import { container } from 'tsyringe';
import { installServices } from './installer';
import AppInterface from './app-interface';

const awsServerlessExpress = require('aws-serverless-express');

installServices('aws');

const { app } = container.resolve<AppInterface>('AppInterface');

const server = awsServerlessExpress.createServer(app);

const handler = async (event: any, context: any) => {
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};

export default handler;
