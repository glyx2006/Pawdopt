import { ApolloClient, InMemoryCache, split, HttpLink, from } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { getAccessToken } from './services/CognitoService';

const API_URL = "https://kjjewznlvbb6xfmdwmezado724.appsync-api.eu-west-2.amazonaws.com/graphql";
const WS_URL = "wss://kjjewznlvbb6xfmdwmezado724.appsync-realtime-api.eu-west-2.amazonaws.com/graphql";
const API_KEY = "da2-qdj4etsy7fgrhe6td4wciul7ci";

// HTTP link with authentication
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await getAccessToken();
    return {
      headers: {
        ...headers,
        "x-api-key": API_KEY,
        ...(token && { Authorization: `Bearer ${token}` }),
      }
    };
  } catch (error) {
    console.warn('Could not get access token, using API key only:', error);
    return {
      headers: {
        ...headers,
        "x-api-key": API_KEY,
      }
    };
  }
});

const httpLink = new HttpLink({
  uri: API_URL,
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URL,
    connectionParams: async () => {
      try {
        const token = await getAccessToken();
        return {
          host: "kjjewznlvbb6xfmdwmezado724.appsync-api.eu-west-2.amazonaws.com",
          "x-api-key": API_KEY,
          ...(token && { Authorization: `Bearer ${token}` }),
        };
      } catch (error) {
        console.warn('Could not get access token for WebSocket, using API key only:', error);
        return {
          host: "kjjewznlvbb6xfmdwmezado724.appsync-api.eu-west-2.amazonaws.com",
          "x-api-key": API_KEY,
        };
      }
    },
  }),
);

// Split link: use WebSocket for subscriptions, HTTP for queries and mutations
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([authLink, httpLink]),
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
