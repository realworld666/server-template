import App from './app';

const startServer = (): Promise<void> => {
  return new Promise<void>((resolve: any, reject: any) => {
    const apiServer = new App();
    apiServer.start().then(resolve).catch(reject);

    const graceful = () => {
      apiServer.stop().then(() => process.exit(0));
    };

    // Stop graceful
    process.on('SIGTERM', graceful);
    process.on('SIGINT', graceful);
  });
};

export default startServer;
