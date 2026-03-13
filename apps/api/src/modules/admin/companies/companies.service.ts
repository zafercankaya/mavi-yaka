import { Injectable, NotFoundException } from '@nestjs/common';
import { Market, Sector } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './companies.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(sector?: Sector, market?: Market) {
    const where: any = {};
    if (sector) where.sector = sector;
    if (market) where.market = market;
    return this.prisma.company.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });
    if (!company) throw new NotFoundException('Şirket bulunamadı');
    return company;
  }

  async create(dto: CreateCompanyDto) {
    return this.prisma.company.create({ data: dto });
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      // Delete job listings of this company
      await tx.jobListing.deleteMany({ where: { companyId: id } });
      // Delete crawl sources of this company
      await tx.crawlSource.deleteMany({ where: { companyId: id } });
      // Delete the company (follows cascade automatically)
      return tx.company.delete({ where: { id } });
    });
  }
}
