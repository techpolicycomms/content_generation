import bcrypt from 'bcryptjs';
import prisma from '../../config/db';
import { signToken } from './jwt';
import { exchangeGoogleCode } from './oauth-google';
import { verifyAppleToken } from './oauth-apple';

interface SignupInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async signup({ email, password, name }: SignupInput) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: 'local',
      },
    });

    // Assign default 'volunteer' role
    await prisma.userRole.create({
      data: { userId: user.id, role: 'volunteer' },
    });

    const token = signToken({ id: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }

  async login({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const roles = await prisma.userRole.findMany({ where: { userId: user.id } });
    const token = signToken({ id: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, roles: roles.map(r => r.role) },
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });
    if (!user) throw new Error('User not found');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map(r => r.role),
    };
  }

  async handleGoogleCallback(code: string) {
    // Exchange authorization code for tokens
    const tokens = await exchangeGoogleCode(code);

    // Decode the id_token to extract user profile
    // Google id_tokens are JWTs — the payload is the middle base64 segment
    const idTokenPayload = JSON.parse(
      Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
    );

    const email: string = idTokenPayload.email;
    const name: string = idTokenPayload.name || email.split('@')[0];
    const picture: string | undefined = idTokenPayload.picture;
    const googleId: string = idTokenPayload.sub;

    // Find or create user
    const user = await this.findOrCreateOAuthUser({
      email,
      name,
      provider: 'google',
      providerId: googleId,
      avatarUrl: picture,
    });

    const token = signToken({ id: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }

  async handleAppleCallback(code: string, idToken: string) {
    // Verify and decode the Apple id_token
    const payload = await verifyAppleToken(idToken);

    const email: string = payload.email;
    // Apple only sends the name on the very first sign-in
    const name: string = payload.name || email.split('@')[0];
    const appleId: string = payload.sub;

    // Find or create user
    const user = await this.findOrCreateOAuthUser({
      email,
      name,
      provider: 'apple',
      providerId: appleId,
    });

    const token = signToken({ id: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }

  /**
   * Shared helper: find an existing user by email or provider ID, or create a new one.
   */
  private async findOrCreateOAuthUser(data: {
    email: string;
    name: string;
    provider: string;
    providerId: string;
    avatarUrl?: string;
  }) {
    // Check if user already exists (by email or provider ID)
    let user = await prisma.user.findUnique({ where: { email: data.email } });

    if (user) {
      // Update provider info if they previously used a different method
      if (!user.providerId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: data.provider,
            providerId: data.providerId,
            avatarUrl: data.avatarUrl || user.avatarUrl,
          },
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          provider: data.provider,
          providerId: data.providerId,
          avatarUrl: data.avatarUrl,
        },
      });

      // Assign default role
      await prisma.userRole.create({
        data: { userId: user.id, role: 'volunteer' },
      });
    }

    return user;
  }
}
