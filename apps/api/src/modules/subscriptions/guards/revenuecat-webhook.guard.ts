import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class RevenueCatWebhookGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;
    const expectedSecret = this.config.get('REVENUECAT_WEBHOOK_SECRET');

    if (!expectedSecret) {
      throw new UnauthorizedException('Webhook secret yapılandırılmamış');
    }

    const expected = `Bearer ${expectedSecret}`;

    if (!authHeader || !safeEqual(authHeader, expected)) {
      throw new UnauthorizedException('Geçersiz webhook secret');
    }

    return true;
  }
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
