import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AdminSectorsService } from './sectors.service';

@Controller('admin/sectors')
@ApiTags('Admin - Sectors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminSectorsController {
  constructor(private readonly sectorsService: AdminSectorsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm sektörleri listele (enum tabanlı, yönetim bilgileriyle)' })
  async findAll() {
    return { data: await this.sectorsService.findAll() };
  }
}
