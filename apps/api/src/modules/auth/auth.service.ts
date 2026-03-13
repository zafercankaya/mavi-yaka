import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import appleSignIn from 'apple-signin-auth';
import { PrismaService } from '../../prisma/prisma.service';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.config.get('GOOGLE_CLIENT_ID'),
    );
  }

  async register(email: string, password: string, displayName?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('EMAIL_ALREADY_REGISTERED');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, displayName, referralCode: generateReferralCode() },
    });

    return this.generateTokens(user.id, user.email, user.role, user.displayName);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    return this.generateTokens(user.id, user.email, user.role, user.displayName);
  }

  async socialLogin(provider: 'GOOGLE' | 'APPLE', idToken: string, displayName?: string) {
    // 1. Provider'dan token doğrula
    const providerData = provider === 'GOOGLE'
      ? await this.verifyGoogleToken(idToken)
      : await this.verifyAppleToken(idToken);

    // 2. (authProvider, providerId) ile kullanıcı ara
    let user = await this.prisma.user.findUnique({
      where: {
        authProvider_providerId: {
          authProvider: provider,
          providerId: providerData.providerId,
        },
      },
    });

    if (user) {
      // Update displayName if missing and provided (Apple sends name only on first login)
      if (!user.displayName && (displayName || providerData.name)) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { displayName: displayName || providerData.name },
        });
      }
      this.logger.log(`Sosyal giriş: mevcut kullanıcı ${user.email} (${provider})`);
      return this.generateTokens(user.id, user.email, user.role, user.displayName);
    }

    // 3. Aynı email ile EMAIL kullanıcı var mı?
    const existingEmailUser = await this.prisma.user.findUnique({
      where: { email: providerData.email },
    });

    if (existingEmailUser) {
      // Auto-link: email doğrulanmış provider'dan geliyor, güvenli
      user = await this.prisma.user.update({
        where: { id: existingEmailUser.id },
        data: {
          authProvider: provider,
          providerId: providerData.providerId,
          displayName: existingEmailUser.displayName || displayName || providerData.name || null,
        },
      });
      this.logger.log(`Hesap bağlandı: ${user.email} → ${provider}`);
      return this.generateTokens(user.id, user.email, user.role, user.displayName);
    }

    // 4. Yeni kullanıcı oluştur
    user = await this.prisma.user.create({
      data: {
        email: providerData.email,
        authProvider: provider,
        providerId: providerData.providerId,
        displayName: displayName || providerData.name || null,
        referralCode: generateReferralCode(),
      },
    });
    this.logger.log(`Yeni sosyal kullanıcı: ${user.email} (${provider})`);

    return this.generateTokens(user.id, user.email, user.role, user.displayName);
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    await this.prisma.user.delete({ where: { id: userId } });
    this.logger.log(`Hesap silindi: ${user.email}`);

    return { message: 'ACCOUNT_DELETED' };
  }

  async refreshTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('USER_NOT_FOUND');
    }

    return this.generateTokens(user.id, user.email, user.role, user.displayName);
  }

  private async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.config.get('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        throw new UnauthorizedException('INVALID_GOOGLE_TOKEN');
      }
      return {
        email: payload.email,
        providerId: payload.sub,
        name: payload.name,
      };
    } catch (err) {
      this.logger.error('Google token doğrulama hatası', err);
      throw new UnauthorizedException('Geçersiz Google token');
    }
  }

  private async verifyAppleToken(idToken: string) {
    try {
      const bundleId = this.config.get('APPLE_BUNDLE_ID', 'com.maviyaka.app');
      const payload = await appleSignIn.verifyIdToken(idToken, {
        audience: [bundleId, 'host.exp.Exponent'],
        ignoreExpiration: false,
      });
      if (!payload.email) {
        throw new UnauthorizedException('INVALID_APPLE_TOKEN');
      }
      return {
        email: payload.email,
        providerId: payload.sub,
        name: undefined as string | undefined,
      };
    } catch (err) {
      this.logger.error('Apple token doğrulama hatası', err);
      throw new UnauthorizedException('Geçersiz Apple token');
    }
  }

  private generateTokens(userId: string, email: string, role: string, displayName?: string | null) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    return { accessToken, refreshToken, user: { id: userId, email, role, displayName: displayName || null } };
  }
}
