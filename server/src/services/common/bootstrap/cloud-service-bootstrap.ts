/**
 * Initial initialization of the cloud service.
 */
export default interface CloudServiceBootstrap {
  init(): Promise<void>;
}
