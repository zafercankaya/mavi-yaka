import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UploadService } from './upload.service';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('upload')
export class UploadController {
  constructor(
    private upload: UploadService,
    private prisma: PrismaService,
  ) {}

  @Post('companies/:id/logo')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCompanyLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Dosya gerekli.');
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new BadRequestException('Firma bulunamadı.');

    if (company.logoUrl) {
      await this.upload.delete(company.logoUrl);
    }

    const url = await this.upload.upload('companies', id, file);
    await this.prisma.company.update({ where: { id }, data: { logoUrl: url } });
    return { logoUrl: url };
  }

  @Delete('companies/:id/logo')
  async deleteCompanyLogo(@Param('id') id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new BadRequestException('Firma bulunamadı.');
    if (company.logoUrl) {
      await this.upload.delete(company.logoUrl);
      await this.prisma.company.update({ where: { id }, data: { logoUrl: null } });
    }
    return { message: 'Logo silindi.' };
  }
}
