import { Injectable, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';

/**
 * Like JwtAuthGuard, but does not throw if no token is present.
 * Sets request.user = null when unauthenticated, allowing
 * endpoints to work for both anonymous and logged-in users.
 */
@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // Don't throw on missing/invalid token — just return null
    return user || null;
  }
}
