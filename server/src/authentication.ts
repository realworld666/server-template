import passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { Request } from 'express';
import { container } from 'tsyringe';
import { BasicStrategy } from 'passport-http';
import IamService from './services/iam-service';
import { Config } from './services/common/config/app-config';
import AppConfigService from './services/common/config/app-config-service';

let initialized = false;

/**
 * Authentication for local mock login. Just return the email address
 * @param userEmail the users email
 * @param password the users access code
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function verifyLogin(userEmail: string, password: string) {
  const config = container.resolve<Config>('Config');
  if (config.authConfig.type !== 'test') {
    return null;
  }

  return {
    email: userEmail,
  };
}

/**
 * Cloud authentication. Calls the current IAM service handler (Cognito for AWS)
 * @param token the JWT token
 */
async function verifyToken(token: string) {
  const iam = container.resolve<IamService>('IamService');
  return iam.verifyToken(token);
}

/**
 * Register the correct authentication strategy with passport
 */
function registerStrategies() {
  if (initialized) return;
  const configService = container.resolve<AppConfigService>(AppConfigService);
  const config = configService.getConfig();

  // If we're using a local mock
  if (config.authConfig.type === 'test') {
    passport.use(
      'local',
      new BasicStrategy(async (username, password, done) => {
        try {
          const user = await verifyLogin(username, password);
          done(null, user);
        } catch (e) {
          done(e);
        }
      })
    );
  } else {
    // Use cloud auth
    passport.use(
      'default',
      new BearerStrategy(async (token, done) => {
        try {
          const user = await verifyToken(token);
          done(null, user);
        } catch (e) {
          done(e);
        }
      })
    );
  }
  initialized = true;
}

/**
 * Configure authentication with express
 * @param request the request
 * @param securityName the security name as defined in the OpenAPI spec file
 * @param scopes optional list of required scopes for this request
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function expressAuthentication(request: Request, securityName: string, scopes?: string[]): Promise<any> {
  registerStrategies();

  const strategy: any = passport.authenticate(securityName, {
    session: false,
  });

  const authResult = await new Promise((resolve, reject) => {
    strategy(request, request.res, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(request.user);
      }
    });
  });
  return authResult;
}
