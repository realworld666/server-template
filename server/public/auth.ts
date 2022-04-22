import { CognitoUser } from 'amazon-cognito-identity-js';
import { ConfigControllerService, ConfigResponse, RegisterData, UserControllerService } from '../generated';
import { Auth } from '@aws-amplify/auth';

const mockSetupLocalStorageKey = 'mock-auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function configureCognito() {
  ConfigControllerService.getConfig().then((config) => {
    if (config.auth.type === 'cognito') {
      console.log(JSON.stringify(config.auth));
      doConfigure(config);
    } else {
      alert('Invalid configuration. Cannot use this login form for local testing. ');
    }
  });
}

function doConfigure(config: ConfigResponse) {
  Auth.configure({
    region: config.auth.region,
    userPoolId: config.auth.userPoolId,
    userPoolWebClientId: config.auth.clientId,
  });
}

/**
 * Calls the register endpoint  and displays the access code form if successful
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function requestCode() {
  const email = document.querySelector<HTMLInputElement>('#email')?.value ?? '';

  const data: RegisterData = {
    email: email,
    action: RegisterData.action.REGISTER,
  };
  try {
    const user = await UserControllerService.registerUser(data);

    console.log(`Email: '${email}'`);
    const config = await ConfigControllerService.getConfig();
    doConfigure(config);
    window.loggedInUser = await Auth.signIn(email.toLowerCase());

    // Switch forms
    const emailForm = (document.querySelector<HTMLInputElement>('#form1')!.style.display = 'none');
    const codeForm = (document.querySelector<HTMLInputElement>('#form2')!.style.display = 'initial');
  } catch (e) {
    alert(e.message);
    throw e;
  }
}

export async function validateCode() {
  const code = document.querySelector<HTMLInputElement>('#code')?.value ?? '';

  if (window.loggedInUser === undefined) throw new Error('Logged in  user not set');

  // Retrieve AWS user
  const user: CognitoUser = await Auth.sendCustomChallengeAnswer(window.loggedInUser, code);

  return user.getSignInUserSession() !== null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function performLogin(): Promise<void> {
  const validCode = await validateCode();
  if (!validCode) {
    alert('Could not validate the code');
    return;
  }

  // get jwt token
  const session = await tryGetCurrentSession();
  if (session === undefined) {
    return undefined;
  }
  const accessToken = session.getIdToken();
  const credentials = accessToken.getJwtToken();

  const queryParams = getQueryParams(window.location.href);
  const redirectUrl = `${queryParams.redirect_uri}#access_token=${encodeURIComponent(
    credentials
  )}&state=${encodeURIComponent(queryParams.state)}&response_type=token`;
  window.location.href = redirectUrl;
}

async function tryGetCurrentSession() {
  try {
    return await Auth.currentSession();
  } catch (err) {
    return undefined;
  }
}

function getQueryParams(url: string): any {
  const qparams: any = {};
  const parts = (url || '').split('?');

  let qparts;
  let qpart;
  let i;

  if (parts.length <= 1) {
    return qparams;
  }
  qparts = parts[1].split('&');
  for (i in qparts) {
    if (Object.prototype.hasOwnProperty.call(qparts, i)) {
      qpart = qparts[i].split('=');
      qparams[decodeURIComponent(qpart[0])] = decodeURIComponent(qpart[1] || '');
    }
  }

  return qparams;
}
