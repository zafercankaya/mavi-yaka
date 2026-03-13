import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class InternalKeyGuard implements CanActivate {
  private readonly logger = new Logger(InternalKeyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-internal-key'] as string | undefined;
    const expectedKey = process.env.INTERNAL_API_KEY;

    if (!expectedKey) {
      this.logger.error('INTERNAL_API_KEY env var is not set — rejecting request');
      throw new ForbiddenException('Internal key not configured');
    }

    if (!key) {
      throw new ForbiddenException('Missing x-internal-key header');
    }

    if (!safeEqual(key, expectedKey)) {
      throw new ForbiddenException('Invalid internal key');
    }

    return true;
  }
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
