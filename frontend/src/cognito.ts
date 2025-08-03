import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'eu-west-2_beCRSyJhz',
  ClientId: '6gif7noadq6h4pcrg4aesumjqm',
};

const userPool = new CognitoUserPool(poolData);

export { userPool, CognitoUser, CognitoUserAttribute, AuthenticationDetails };

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

export async function signOut(): Promise<void> {
  const user = userPool.getCurrentUser();
  if (user) {
    return new Promise((resolve, reject) => {
      user.signOut();
      resolve();
    });
  } else {
    return Promise.resolve();
  }
}

export async function getCurrentUserAttributes(): Promise<Record<string, string> | null> {
  // First, get the current user. If no user is found, return null immediately.
  const user = userPool.getCurrentUser();
  if (!user) {
    console.log('No user found in user pool. Returning null.');
    return null;
  }

  // Await the session to be ready. This is a crucial step to handle timing issues.
  try {
    const session = await new Promise((resolve, reject) => {
      user.getSession((err: Error | null, userSession: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(userSession);
        }
      });
    });

    if (!session ) {
      console.log('Invalid user session. Returning null.');
      return null;
    }
  } catch (error) {
    console.log('Error getting user session:', error);
    return null;
  }

  // Now that we have a valid session, fetch the user attributes.
  return new Promise((resolve) => {
    user.getUserAttributes((err: Error | undefined, attributes: CognitoUserAttribute[] | undefined) => {
      if (err || !attributes) {
        console.log('Error fetching user attributes:', err || 'No attributes found');
        // On error, we resolve with null instead of rejecting.
        resolve(null);
      } else {
        const attrMap: Record<string, string> = {};
        attributes.forEach(attr => {
          attrMap[attr.getName()] = attr.getValue();
        });
        resolve(attrMap);
      }
    });
  });
}

export async function updateUserAttributes(attributes: Record<string, string>): Promise<void> {
  const user = userPool.getCurrentUser();

  // 1. Check for a user and a valid session first.
  if (!user) {
    console.error('Update user attributes failed: No user is currently logged in.');
    // We resolve the Promise here to prevent the calling code from crashing.
    return Promise.resolve();
  }

  // 2. Refresh the session to ensure it's valid before making the API call.
  // The call to `user.getSession()` automatically refreshes the session if needed.
  try {
    await new Promise<CognitoUserSession>((resolve, reject) => {
      user.getSession((err: Error | null, userSession: CognitoUserSession | null) => {
        if (err || !userSession || !userSession.isValid()) {
          reject(new Error('User session is invalid or could not be refreshed.'));
        } else {
          resolve(userSession);
        }
      });
    });
  } catch (error) {
    console.error('Update user attributes failed: Invalid or expired session.', error);
    return; // Exit the function if the session is not valid.
  }

  // 3. Convert the attributes object into an array of CognitoUserAttribute objects.
  const attrList = Object.entries(attributes).map(([key, value]) => new CognitoUserAttribute({ Name: key, Value: value }));

  // 4. Perform the update with the now-validated user object.
  return new Promise<void>((resolve) => {
    user.updateAttributes(attrList, (err: Error | undefined, result: any) => {
      if (err) {
        console.error('Update user attributes failed:', err);
        // Instead of rejecting the promise, we resolve it to prevent a crash.
        resolve();
      } else {
        console.log('Update user attributes successful:', result);
        resolve();
      }
    });
  });
}