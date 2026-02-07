import { config } from './env';

export const googleOAuthConfig = {
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  callbackURL: config.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email'],
};

export const appleOAuthConfig = {
  clientID: config.APPLE_CLIENT_ID,
  teamID: config.APPLE_TEAM_ID,
  keyID: config.APPLE_KEY_ID,
  privateKeyPath: config.APPLE_PRIVATE_KEY_PATH,
  callbackURL: config.APPLE_CALLBACK_URL,
  scope: ['name', 'email'],
};
