import { Application } from 'express';
import { Config } from './app-config';

export default interface AppInterface {
  readonly app: Application;
  readonly config: Config;

  start(): Promise<any>;

  stop(): Promise<boolean>;
}
