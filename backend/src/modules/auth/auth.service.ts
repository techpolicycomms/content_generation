import bcrypt from 'bcryptjs';
import prisma from '../../config/db';
import { signToken, verifyToken } from './jwt';

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
    // Exchange code for tokens with Google OAuth API
    // Extract user profile from ID token
    // Create or update user in DB
    // Return JWT + user info
    throw new Error('Google OAuth callback not yet implemented');
  }

  async handleAppleCallback(code: string, idToken: string) {
    // Verify Apple ID token
    // Extract user profile
    // Create or update user in DB
    // Return JWT + user info
    throw new Error('Apple OAuth callback not yet implemented');
  }
}
