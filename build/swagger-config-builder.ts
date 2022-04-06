import * as fs from 'fs';
import * as path from 'path';

/**
 * Entry point for the script.  Required to make use of await, which can't be done from the base scope
 */
(async function main() {
  const outputSwaggerConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'swagger.config.json'), 'utf8'));

  fs.writeFileSync(path.join(__dirname, '..', 'dist', 'swagger.config.json'), JSON.stringify(outputSwaggerConfig, null, 4));
})();
