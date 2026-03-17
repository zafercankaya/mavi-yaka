import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Market } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/cache.service';

@Controller('locations')
@ApiTags('Locations (Public)')
export class LocationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Konum listesi (ülke/eyalet bazlı)' })
  @ApiQuery({ name: 'country', enum: Market, required: true, description: 'Ülke kodu' })
  @ApiQuery({ name: 'state', required: false, description: 'Eyalet/il filtresi (şehirleri getir)' })
  async findAll(
    @Query('country') country: Market,
    @Query('state') state?: string,
  ) {
    const cacheKey = `locations:${country}:${state || 'all'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    if (state) {
      // Return cities for a specific state
      const cities = await this.prisma.location.findMany({
        where: {
          country,
          state: { equals: state, mode: 'insensitive' },
          city: { not: null },
        },
        select: {
          id: true,
          city: true,
          nameLocal: true,
          nameEn: true,
          latitude: true,
          longitude: true,
          population: true,
        },
        orderBy: [
          { population: { sort: 'desc', nulls: 'last' } },
          { city: 'asc' },
        ],
      });

      const result = { data: cities };
      this.cache.set(cacheKey, result, 3600); // 1 hour
      return result;
    }

    // Return states for a country
    const states = await this.prisma.location.findMany({
      where: {
        country,
        city: null, // State-level entries (no city)
      },
      select: {
        id: true,
        state: true,
        nameLocal: true,
        nameEn: true,
        latitude: true,
        longitude: true,
        population: true,
      },
      orderBy: [
        { population: { sort: 'desc', nulls: 'last' } },
        { state: 'asc' },
      ],
    });

    // If no state-level entries, get distinct states from all locations
    if (states.length === 0) {
      const distinctStates = await this.prisma.location.findMany({
        where: { country },
        distinct: ['state'],
        select: {
          id: true,
          state: true,
          nameLocal: true,
          nameEn: true,
          latitude: true,
          longitude: true,
          population: true,
        },
        orderBy: { state: 'asc' },
      });

      const result = { data: distinctStates };
      this.cache.set(cacheKey, result, 3600);
      return result;
    }

    const result = { data: states };
    this.cache.set(cacheKey, result, 3600); // 1 hour
    return result;
  }
}
