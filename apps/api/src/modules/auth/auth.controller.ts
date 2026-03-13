import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
@ApiTags('Auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı' })
  async register(@Body() dto: RegisterDto) {
    return {
      data: await this.authService.register(
        dto.email,
        dto.password,
        dto.displayName,
      ),
    };
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Kullanıcı girişi' })
  async login(@Body() dto: LoginDto) {
    return { data: await this.authService.login(dto.email, dto.password) };
  }

  @Post('social-login')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: 'Google / Apple ile giriş' })
  async socialLogin(@Body() dto: SocialLoginDto) {
    return {
      data: await this.authService.socialLogin(dto.provider, dto.idToken, dto.displayName),
    };
  }

  @Delete('account')
  @HttpCode(200)
  @Throttle({ default: { ttl: 3600000, limit: 3 } })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hesap silme' })
  async deleteAccount(@Request() req: any) {
    return { data: await this.authService.deleteAccount(req.user.sub) };
  }

  @Post('refresh')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Token yenileme' })
  async refresh(@Request() req: any) {
    return { data: await this.authService.refreshTokens(req.user.sub) };
  }
}
