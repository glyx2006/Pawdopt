import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'eu-west-2_beCRSyJhz', 
  ClientId: '6gif7noadq6h4pcrg4aesumjqm' 
};

const userPool = new CognitoUserPool(poolData);

export { userPool, CognitoUser, CognitoUserAttribute, AuthenticationDetails };
