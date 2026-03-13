import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, JobStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/cache.service';
import { JobQueryDto, JobSort } from './jobs.dto';

const jobListingSelect = {
  id: true,
  title: true,
  slug: true,
  companyId: true,
  sourceUrl: true,
  canonicalUrl: true,
  country: true,
  state: true,
  city: true,
  latitude: true,
  longitude: true,
  sector: true,
  jobType: true,
  workMode: true,
  salaryMin: true,
  salaryMax: true,
  salaryCurrency: true,
  salaryPeriod: true,
  experienceLevel: true,
  description: true,
  requirements: true,
  benefits: true,
  deadline: true,
  postedDate: true,
  imageUrl: true,
  status: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      sector: true,
    },
  },
} satisfies Prisma.JobListingSelect;

/** Lightweight select for list views (omits heavy text fields) */
const jobListingListSelect = {
  id: true,
  title: true,
  slug: true,
  companyId: true,
  country: true,
  state: true,
  city: true,
  latitude: true,
  longitude: true,
  sector: true,
  jobType: true,
  workMode: true,
  salaryMin: true,
  salaryMax: true,
  salaryCurrency: true,
  salaryPeriod: true,
  experienceLevel: true,
  deadline: true,
  postedDate: true,
  imageUrl: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      sector: true,
    },
  },
} satisfies Prisma.JobListingSelect;

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(query: JobQueryDto, userId?: string) {
    const limit = query.limit ?? 20;

    // Cache only non-personalized queries
    const isCacheable = !query.followingOnly && !userId;
    const cacheKey = isCacheable
      ? `jobs:${query.country || 'all'}:${query.sort || 'default'}:${query.cursor || '0'}:${limit}:${query.sector || ''}:${query.jobType || ''}:${query.workMode || ''}:${query.experienceLevel || ''}:${query.companyId || ''}:${query.state || ''}:${query.city || ''}:${query.search || ''}:${query.salaryMin || ''}:${query.salaryMax || ''}:${query.postedWithinDays || ''}`
      : null;

    if (cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    // Parse comma-separated company IDs
    const parsedCompanyIds = query.companyIds
      ? query.companyIds.split(',').map((id) => id.trim()).filter(Boolean)
      : undefined;

    const where: Prisma.JobListingWhereInput = {
      status: query.status ?? JobStatus.ACTIVE,
      ...(query.country && { country: query.country }),
      ...(query.state && { state: { equals: query.state, mode: 'insensitive' as const } }),
      ...(query.city && { city: { equals: query.city, mode: 'insensitive' as const } }),
      ...(query.sector && { sector: query.sector }),
      ...(query.jobType && { jobType: query.jobType }),
      ...(query.workMode && { workMode: query.workMode }),
      ...(query.experienceLevel && { experienceLevel: query.experienceLevel }),
      ...(parsedCompanyIds && parsedCompanyIds.length > 0
        ? { companyId: { in: parsedCompanyIds } }
        : query.companyId ? { companyId: query.companyId } : {}),
      ...(query.salaryMin && { salaryMax: { gte: query.salaryMin } }),
      ...(query.salaryMax && { salaryMin: { lte: query.salaryMax } }),
      ...(query.postedWithinDays && {
        createdAt: { gte: new Date(Date.now() - query.postedWithinDays * 24 * 60 * 60 * 1000) },
      }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { description: { contains: query.search, mode: 'insensitive' as const } },
          { company: { name: { contains: query.search, mode: 'insensitive' as const } } },
        ],
      }),
    };

    // followingOnly: restrict to followed companies
    if (query.followingOnly) {
      if (!userId) {
        return { data: [], meta: { nextCursor: null, hasMore: false, total: 0 } };
      }

      const followedCompanies = await this.prisma.followedCompany.findMany({
        where: { userId },
        select: { companyId: true, company: { select: { market: true } } },
      });

      // Filter by requested country if provided
      const followedCompanyIds = followedCompanies
        .filter((f) => !query.country || f.company?.market === query.country)
        .map((f) => f.companyId);

      if (followedCompanyIds.length === 0) {
        return { data: [], meta: { nextCursor: null, hasMore: false, total: 0 } };
      }

      if (parsedCompanyIds && parsedCompanyIds.length > 0) {
        // User selected specific companies — intersect with followed
        const validIds = parsedCompanyIds.filter((id) => followedCompanyIds.includes(id));
        where.companyId = validIds.length > 0 ? { in: validIds } : { in: [] };
      } else {
        const companyFilter: Prisma.JobListingWhereInput = { companyId: { in: followedCompanyIds } };
        if (where.OR) {
          const searchOr = where.OR;
          delete where.OR;
          where.AND = [
            { OR: searchOr as Prisma.JobListingWhereInput[] },
            companyFilter,
          ];
        } else {
          Object.assign(where, companyFilter);
        }
      }
    }

    // Recommended sort uses in-memory scoring
    if (query.sort === JobSort.RECOMMENDED) {
      const result = await this.findAllRecommended(where, limit, query.cursor);
      if (cacheKey) this.cache.set(cacheKey, result, 300);
      return result;
    }

    // Nearest sort uses in-memory distance calculation
    if (query.sort === JobSort.NEAREST && query.lat != null && query.lng != null) {
      const result = await this.findAllNearest(where, limit, query.cursor, query.lat, query.lng);
      if (cacheKey) this.cache.set(cacheKey, result, 300);
      return result;
    }

    const orderBy = this.getOrderBy(query.sort);

    const jobs = await this.prisma.jobListing.findMany({
      where,
      select: jobListingListSelect,
      orderBy,
      take: limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
    });

    const hasMore = jobs.length > limit;
    const items = hasMore ? jobs.slice(0, limit) : jobs;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const total = await this.prisma.jobListing.count({ where });

    const result = {
      data: items.map(this.formatJobListItem),
      meta: { nextCursor, hasMore, total },
    };

    if (cacheKey) {
      this.cache.set(cacheKey, result, 300); // 5 minutes
    }

    return result;
  }

  async findOne(id: string) {
    const cacheKey = `job:${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const job = await this.prisma.jobListing.findUnique({
      where: { id },
      select: jobListingSelect,
    });

    if (!job) throw new NotFoundException('JOB_NOT_FOUND');

    // Increment view count (fire-and-forget)
    this.prisma.jobListing
      .update({ where: { id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});

    const result = this.formatJob(job);
    this.cache.set(cacheKey, result, 600); // 10 minutes
    return result;
  }

  private getOrderBy(sort?: JobSort): Prisma.JobListingOrderByWithRelationInput {
    switch (sort) {
      case JobSort.SALARY_HIGH:
        return { salaryMax: { sort: 'desc', nulls: 'last' } };
      case JobSort.ENDING_SOON:
        return { deadline: { sort: 'asc', nulls: 'last' } };
      case JobSort.NEWEST:
      default:
        return { createdAt: 'desc' };
    }
  }

  private async findAllRecommended(
    where: Prisma.JobListingWhereInput,
    limit: number,
    cursor?: string,
  ) {
    const batchSize = Math.min(limit * 20, 500);
    const jobs = await this.prisma.jobListing.findMany({
      where,
      select: jobListingListSelect,
      orderBy: { createdAt: 'desc' },
      take: batchSize,
    });

    const now = Date.now();
    const scored = jobs.map((j) => ({
      ...j,
      _score: this.computeRecommendedScore(j, now),
    }));

    scored.sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = scored.findIndex((j) => j.id === cursor);
      startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    }

    const sliced = scored.slice(startIndex, startIndex + limit + 1);
    const hasMore = sliced.length > limit;
    const items = hasMore ? sliced.slice(0, limit) : sliced;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const total = await this.prisma.jobListing.count({ where });

    return {
      data: items.map((j) => {
        const { _score, ...rest } = j;
        return this.formatJobListItem(rest);
      }),
      meta: { nextCursor, hasMore, total },
    };
  }

  private async findAllNearest(
    where: Prisma.JobListingWhereInput,
    limit: number,
    cursor: string | undefined,
    userLat: number,
    userLng: number,
  ) {
    // Fetch a larger batch and sort by distance in memory
    const batchSize = Math.min(limit * 20, 500);
    const jobs = await this.prisma.jobListing.findMany({
      where: {
        ...where,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: jobListingListSelect,
      orderBy: { createdAt: 'desc' },
      take: batchSize,
    });

    const withDistance = jobs.map((j) => ({
      ...j,
      _distance: this.haversineDistance(
        userLat, userLng,
        j.latitude!, j.longitude!,
      ),
    }));

    withDistance.sort((a, b) => a._distance - b._distance);

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = withDistance.findIndex((j) => j.id === cursor);
      startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    }

    const sliced = withDistance.slice(startIndex, startIndex + limit + 1);
    const hasMore = sliced.length > limit;
    const items = hasMore ? sliced.slice(0, limit) : sliced;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const total = await this.prisma.jobListing.count({
      where: { ...where, latitude: { not: null }, longitude: { not: null } },
    });

    return {
      data: items.map((j) => {
        const { _distance, ...rest } = j;
        return { ...this.formatJobListItem(rest), distance: Math.round(_distance * 10) / 10 };
      }),
      meta: { nextCursor, hasMore, total },
    };
  }

  private computeRecommendedScore(j: any, now: number): number {
    let score = 0;

    // Salary weight (max 25) — higher salary = higher score
    const salaryMax = j.salaryMax ? Number(j.salaryMax) : 0;
    if (salaryMax > 0) {
      score += Math.min(25, salaryMax / 1000);
    }

    // Urgency weight — deadline approaching
    if (j.deadline) {
      const daysUntilDeadline = (new Date(j.deadline).getTime() - now) / 86400000;
      if (daysUntilDeadline > 0 && daysUntilDeadline <= 3) score += 25;
      else if (daysUntilDeadline > 0 && daysUntilDeadline <= 7) score += 15;
      else if (daysUntilDeadline > 0 && daysUntilDeadline <= 14) score += 5;
    }

    // Recency weight
    const ageDays = (now - new Date(j.createdAt).getTime()) / 86400000;
    if (ageDays <= 1) score += 20;
    else if (ageDays <= 3) score += 10;
    else if (ageDays <= 7) score += 5;

    // Completeness bonus — jobs with more details rank higher
    if (j.salaryMin || j.salaryMax) score += 5;
    if (j.imageUrl) score += 3;

    return score;
  }

  /** Haversine distance in kilometers */
  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /** Format a job listing for list views (no heavy text fields) */
  private formatJobListItem(j: any) {
    return {
      id: j.id,
      title: j.title,
      slug: j.slug,
      companyId: j.companyId,
      company: j.company
        ? { id: j.company.id, name: j.company.name, slug: j.company.slug, logoUrl: j.company.logoUrl, sector: j.company.sector }
        : null,
      country: j.country,
      state: j.state,
      city: j.city,
      sector: j.sector,
      jobType: j.jobType,
      workMode: j.workMode,
      salaryMin: j.salaryMin ? Number(j.salaryMin) : null,
      salaryMax: j.salaryMax ? Number(j.salaryMax) : null,
      salaryCurrency: j.salaryCurrency,
      salaryPeriod: j.salaryPeriod,
      experienceLevel: j.experienceLevel,
      deadline: j.deadline,
      postedDate: j.postedDate,
      imageUrl: j.imageUrl,
      status: j.status,
      createdAt: j.createdAt,
      updatedAt: j.updatedAt,
    };
  }

  /** Format a full job listing for detail views (includes description, requirements, benefits) */
  private formatJob(j: any) {
    return {
      ...this.formatJobListItem(j),
      sourceUrl: j.sourceUrl,
      canonicalUrl: j.canonicalUrl,
      latitude: j.latitude,
      longitude: j.longitude,
      description: j.description,
      requirements: j.requirements,
      benefits: j.benefits,
      viewCount: j.viewCount,
    };
  }
}
