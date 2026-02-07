import { appleOAuthConfig } from '../../config/oauth';

/**
 * Apple Sign-In flow handler.
 *
 * Flow:
 * 1. Redirect user to Apple authorization URL
 * 2. Apple redirects back with authorization code + id_token
 * 3. Verify id_token using Apple's public keys
 * 4. Extract user info (email, name - only sent on first auth)
 * 5. Find or create user in DB
 * 6. Issue app JWT
 *
 * Note: Apple requires generating a client_secret JWT signed with your .p8 key.
 * The secret must be regenerated periodically (max 6-month validity).
 */

export function getAppleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: appleOAuthConfig.clientID,
    redirect_uri: appleOAuthConfig.callbackURL,
    response_type: 'code id_token',
    scope: appleOAuthConfig.scope.join(' '),
    response_mode: 'form_post',
  });
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

export async function verifyAppleToken(idToken: string) {
  // Fetch Apple's public keys from https://appleid.apple.com/auth/keys
  // Verify the JWT signature against Apple's public keys
  // Validate claims (iss, aud, exp)
  // Return decoded payload with user info
  throw new Error('Apple token verification not yet implemented');
}
