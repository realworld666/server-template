import { Application } from 'express';

export default interface AppInterface {
  readonly app: Application;

  start(): Promise<any>;

  stop(): Promise<boolean>;
}
