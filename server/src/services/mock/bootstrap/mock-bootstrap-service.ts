import CloudServiceBootstrap from '../../common/bootstrap/cloud-service-bootstrap';

export default class MockBootstrapService implements CloudServiceBootstrap {
  async init(): Promise<void> {
    // Do nothing
  }
}
