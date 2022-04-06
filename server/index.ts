import startServer from './start-server';

startServer().catch((err) => {
  console.error(`Error starting server: ${err.message}`);
  process.exit(-1);
});
