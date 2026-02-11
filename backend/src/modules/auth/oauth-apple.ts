import jwt from 'jsonwebtoken';
import { appleOAuthConfig } from '../../config/oauth';

/**
 * Apple Sign-In flow handler.
 *
 * Flow:
 * 1. Redirect user to Apple authorization URL
 * 2. Apple redirects back with authorization code + id_token (form_post)
 * 3. Verify id_token using Apple's public keys (JWKS)
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

/**
 * Fetches Apple's current JSON Web Key Set for token verification.
 */
async function getApplePublicKeys(): Promise<any[]> {
  const response = await fetch('https://appleid.apple.com/auth/keys');
  if (!response.ok) {
    throw new Error('Failed to fetch Apple public keys');
  }
  const data = await response.json();
  return data.keys;
}

/**
 * Converts a JWK RSA key to PEM format for use with the jsonwebtoken library.
 */
function jwkToPem(jwk: { n: string; e: string }): string {
  // base64url decode modulus and exponent
  const modulus = Buffer.from(jwk.n.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const exponent = Buffer.from(jwk.e.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

  function encodeLength(len: number): Buffer {
    if (len < 128) return Buffer.from([len]);
    if (len < 256) return Buffer.from([0x81, len]);
    return Buffer.from([0x82, (len >> 8) & 0xff, len & 0xff]);
  }

  function encodeInteger(buf: Buffer): Buffer {
    const padded = buf[0] & 0x80 ? Buffer.concat([Buffer.from([0x00]), buf]) : buf;
    return Buffer.concat([Buffer.from([0x02]), encodeLength(padded.length), padded]);
  }

  const modInt = encodeInteger(modulus);
  const expInt = encodeInteger(exponent);
  const seqInner = Buffer.concat([modInt, expInt]);
  const seqInnerWrapped = Buffer.concat([
    Buffer.from([0x30]),
    encodeLength(seqInner.length),
    seqInner,
  ]);

  const bitString = Buffer.concat([
    Buffer.from([0x03]),
    encodeLength(seqInnerWrapped.length + 1),
    Buffer.from([0x00]),
    seqInnerWrapped,
  ]);

  // RSA algorithm OID
  const algorithmId = Buffer.from([
    0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86,
    0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
  ]);

  const outerSeq = Buffer.concat([algorithmId, bitString]);
  const der = Buffer.concat([Buffer.from([0x30]), encodeLength(outerSeq.length), outerSeq]);

  const b64 = der.toString('base64').match(/.{1,64}/g)!.join('\n');
  return `-----BEGIN PUBLIC KEY-----\n${b64}\n-----END PUBLIC KEY-----`;
}

/**
 * Verifies an Apple id_token JWT against Apple's public JWKS keys
 * and returns the decoded payload containing user info.
 */
export async function verifyAppleToken(idToken: string): Promise<{
  sub: string;
  email: string;
  name?: string;
}> {
  // Decode header to find the key ID
  const header = JSON.parse(
    Buffer.from(idToken.split('.')[0], 'base64').toString()
  );

  // Fetch Apple's public keys and match by kid
  const keys = await getApplePublicKeys();
  const matchingKey = keys.find((k: any) => k.kid === header.kid);
  if (!matchingKey) {
    throw new Error('No matching Apple public key found for token');
  }

  // Verify signature and claims
  const pem = jwkToPem(matchingKey);
  const decoded = jwt.verify(idToken, pem, {
    algorithms: ['RS256'],
    issuer: 'https://appleid.apple.com',
    audience: appleOAuthConfig.clientID,
  }) as any;

  return {
    sub: decoded.sub,
    email: decoded.email,
    name: decoded.name,
  };
}
