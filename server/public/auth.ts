import {ConfigControllerService, ConfigResponse, RegisterData, UserControllerService} from "../generated";
import { Amplify } from "aws-amplify";
import { confirmSignIn, fetchAuthSession, signIn } from "aws-amplify/auth";
const mockSetupLocalStorageKey = 'mock-auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function configureCognito() {
  ConfigControllerService.getConfig().then((config:ConfigResponse) => {
    if (config.auth.type === 'aws') {
      console.log(JSON.stringify(config.auth));
      doConfigure(config);
    } else {
      alert('Invalid configuration. Cannot use this login form for local testing. ');
    }
  });
}

function doConfigure(config: ConfigResponse) {
  Amplify.configure({
    Auth:{
      Cognito:{
        userPoolId: config.auth.userPoolId,
        userPoolClientId: config.auth.clientId
      }
    }
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

    const { isSignedIn, nextStep } = await signIn({ username: email.toLowerCase() });

    if (isSignedIn) {
      console.log('User signed in successfully');
    } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
      console.log('Custom challenge required');
    } else {
      console.log('Unexpected sign-in step:', nextStep.signInStep);
    }

    // Switch forms
    document.querySelector<HTMLElement>('#form1')!.style.display = 'none';
    document.querySelector<HTMLElement>('#form2')!.style.display = 'initial';
  } catch (e) {
    console.error('Error during registration or sign-in:', e);
    alert(e.message || 'An error occurred during registration or sign-in');
    throw e;
  }
}

export async function validateCode() {
  const code = document.querySelector<HTMLInputElement>('#code')?.value ?? '';

  try {
    const { isSignedIn } = await confirmSignIn({ challengeResponse: code });
    return isSignedIn;
  } catch (error) {
    console.error('Error validating code:', error);
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function performLogin(): Promise<void> {
  const validCode = await validateCode();
  if (!validCode) {
    alert('Could not validate the code');
    return;
  }
  try {
    const { tokens } = await fetchAuthSession();
    if (!tokens) {
      console.log('No active session found');
      return;
    }
    const idToken = tokens.idToken;
    const jwtToken = idToken.toString();

    const queryParams = new URLSearchParams(window.location.search);
    const redirectUri = queryParams.get('redirect_uri');
    const state = queryParams.get('state');
    if (!redirectUri || !state) {
      console.error('Missing required query parameters');
      return;
    }

    const redirectUrl = `${redirectUri}#access_token=${encodeURIComponent(jwtToken)}&state=${encodeURIComponent(state)}&response_type=token`;
    window.location.href = redirectUrl;
  }
  catch (error) {
    console.error('Error fetching session:', error);
  }
}

async function tryGetCurrentSession() {
  try {
    const { tokens } = await fetchAuthSession();
    return tokens;
  } catch (err) {
    console.error('Error fetching auth session:', err);
    return undefined;
  }
}

function getQueryParams(url: string): {[key:string]:string} {
  const qparams: {[key:string]:string} = {};
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
