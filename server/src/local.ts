import 'reflect-metadata';
import { config as configDotenv } from 'dotenv';
import { container } from 'tsyringe';
import { installServices } from './installer';
import AppInterface from './app-interface';

configDotenv();

installServices(process.env.ENV ?? 'test');

const app = container.resolve<AppInterface>('AppInterface');
app.start();
