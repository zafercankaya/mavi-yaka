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

  @Get('search')
  @ApiOperation({ summary: 'Konum arama (autocomplete)' })
  @ApiQuery({ name: 'country', enum: Market, required: true })
  @ApiQuery({ name: 'q', required: true, description: 'Arama terimi (min 2 karakter)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max sonuç (default 15)' })
  async search(
    @Query('country') country: Market,
    @Query('q') q: string,
    @Query('limit') limitStr?: string,
  ) {
    const query = (q || '').trim();
    if (query.length < 2) return { data: [] };

    const limit = Math.min(parseInt(limitStr || '15', 10) || 15, 50);
    const cacheKey = `loc-search:${country}:${query.toLowerCase()}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Search both nameLocal and nameEn, plus state and city fields
    const locations = await this.prisma.location.findMany({
      where: {
        country,
        OR: [
          { nameLocal: { contains: query, mode: 'insensitive' } },
          { nameEn: { contains: query, mode: 'insensitive' } },
          { state: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        state: true,
        city: true,
        nameLocal: true,
        nameEn: true,
        latitude: true,
        longitude: true,
        population: true,
      },
      orderBy: [
        { population: { sort: 'desc', nulls: 'last' } },
      ],
      take: limit,
    });

    // Also search job listings for cities not in Location table
    const jobCities = await this.prisma.jobListing.findMany({
      where: {
        country,
        status: 'ACTIVE',
        OR: [
          { city: { contains: query, mode: 'insensitive' } },
          { state: { contains: query, mode: 'insensitive' } },
        ],
      },
      distinct: ['city', 'state'],
      select: { city: true, state: true },
      take: 20,
    });

    // Merge: Location table results first, then job listing cities
    const seen = new Set(locations.map(l => `${l.state}:${l.city || ''}`));
    const extraFromJobs = jobCities
      .filter(j => j.city && !seen.has(`${j.state || ''}:${j.city}`))
      .map(j => ({
        id: null,
        state: j.state,
        city: j.city,
        nameLocal: j.city,
        nameEn: j.city,
        latitude: null,
        longitude: null,
        population: null,
      }));

    const merged = [...locations, ...extraFromJobs].slice(0, limit);

    const result = { data: merged };
    this.cache.set(cacheKey, result, 1800); // 30 min
    return result;
  }
}
