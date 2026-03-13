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

  @Post('brands/:id/logo')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async uploadBrandLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Dosya gerekli.');
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new BadRequestException('Marka bulunamadı.');

    // Delete old logo if exists
    if (brand.logoUrl) {
      await this.upload.delete(brand.logoUrl);
    }

    const url = await this.upload.upload('brands', id, file);
    await this.prisma.brand.update({ where: { id }, data: { logoUrl: url } });
    return { logoUrl: url };
  }

  @Delete('brands/:id/logo')
  async deleteBrandLogo(@Param('id') id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new BadRequestException('Marka bulunamadı.');
    if (brand.logoUrl) {
      await this.upload.delete(brand.logoUrl);
      await this.prisma.brand.update({ where: { id }, data: { logoUrl: null } });
    }
    return { message: 'Logo silindi.' };
  }

  @Post('categories/:id/icon')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCategoryIcon(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Dosya gerekli.');
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new BadRequestException('Kategori bulunamadı.');

    if (category.iconUrl) {
      await this.upload.delete(category.iconUrl);
    }

    const url = await this.upload.upload('categories', id, file);
    await this.prisma.category.update({ where: { id }, data: { iconUrl: url } });
    return { iconUrl: url };
  }

  @Delete('categories/:id/icon')
  async deleteCategoryIcon(@Param('id') id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new BadRequestException('Kategori bulunamadı.');
    if (category.iconUrl) {
      await this.upload.delete(category.iconUrl);
      await this.prisma.category.update({ where: { id }, data: { iconUrl: null } });
    }
    return { message: 'İkon silindi.' };
  }
}
