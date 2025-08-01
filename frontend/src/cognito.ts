import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'eu-west-2_beCRSyJhz',
  ClientId: '6gif7noadq6h4pcrg4aesumjqm',
};

const userPool = new CognitoUserPool(poolData);

export async function signIn(email: string, password: string): Promise<string> {
  const user = new CognitoUser({ Username: email, Pool: userPool });
  const authDetails = new AuthenticationDetails({ Username: email, Password: password });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        resolve(result.getIdToken().getJwtToken());
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

export async function getAccessToken(): Promise<string | null> {
  const user = userPool.getCurrentUser();
  if (!user) return null;

  return new Promise((resolve, reject) => {
    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) {
        reject(err);
      } else {
        resolve(session.getIdToken().getJwtToken());
      }
    });

  });
}
