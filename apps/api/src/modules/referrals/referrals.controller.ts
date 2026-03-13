import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReferralsService } from './referrals.service';
import { ApplyReferralDto } from './referrals.dto';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('my-code')
  async getMyCode(@Request() req: any) {
    const code = await this.referralsService.getMyCode(req.user.sub);
    return { data: { code } };
  }

  @Post('apply')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  async applyCode(@Request() req: any, @Body() dto: ApplyReferralDto) {
    const result = await this.referralsService.applyCode(req.user.sub, dto.code);
    return { data: result };
  }
}
