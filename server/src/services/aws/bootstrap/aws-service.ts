import AWS from 'aws-sdk';
import { singleton } from 'tsyringe';
import CloudServiceBootstrap from '../../common/bootstrap/cloud-service-bootstrap';

@singleton()
export class AwsService implements CloudServiceBootstrap {
  async init(): Promise<void> {
    AWS.config.update({ region: process.env.REGION });
  }
}
