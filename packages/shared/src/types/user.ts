import { z } from 'zod';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}

export enum Platform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const socialLoginSchema = z.object({
  provider: z.enum(['GOOGLE', 'APPLE']),
  idToken: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type SocialLoginDto = z.infer<typeof socialLoginSchema>;

export interface UserPublic {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  authProvider: AuthProvider;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
