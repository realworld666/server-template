/* eslint-disable @typescript-eslint/dot-notation,@typescript-eslint/no-unused-expressions */
import 'reflect-metadata';
import { container } from 'tsyringe';
import chai, { expect } from 'chai';
import { ConfigService } from './config-service';

chai.use(require('chai-as-promised'));

describe('Config Service', () => {
  it('get the current config', async () => {
    // the single test
    const configService = container.resolve(ConfigService);

    const config = await configService.getConfig();

    expect(config).to.be.not.null;
    expect(config).to.be.not.undefined;
    expect(config.version).to.eq('2.1.0');
    expect(config.auth.type).to.eq('test');
  });
});
