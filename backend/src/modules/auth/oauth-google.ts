import { googleOAuthConfig } from '../../config/oauth';

/**
 * Google OAuth 2.0 flow handler.
 *
 * Flow:
 * 1. Redirect user to Google consent URL
 * 2. Google redirects back with authorization code
 * 3. Exchange code for access_token + id_token
 * 4. Decode id_token to get user profile (email, name, picture)
 * 5. Find or create user in DB
 * 6. Issue app JWT
 */

export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: googleOAuthConfig.clientID,
    redirect_uri: googleOAuthConfig.callbackURL,
    response_type: 'code',
    scope: googleOAuthConfig.scope.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: googleOAuthConfig.clientID,
      client_secret: googleOAuthConfig.clientSecret,
      redirect_uri: googleOAuthConfig.callbackURL,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange Google authorization code');
  }

  return response.json();
}
