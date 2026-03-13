import { PrismaClient } from '@prisma/client';

const API_URL = process.env.API_URL || 'http://localhost:3000';

/**
 * Crawl sonrası yeni bulunan iş ilanları için API'ye bildirim isteği gönderir.
 * API tarafındaki NotificationsService Expo Push üzerinden bildirim gönderir.
 */
export async function notifyNewJobListings(
  prisma: PrismaClient,
  companyId: string,
  newJobListingIds: string[],
): Promise<void> {
  if (newJobListingIds.length === 0) return;

  // DB'den yeni iş ilanı detaylarını al
  const jobListings = await prisma.jobListing.findMany({
    where: { id: { in: newJobListingIds } },
    select: { id: true, title: true, sector: true },
  });

  if (jobListings.length === 0) return;

  // Sektörleri topla
  const sectors = [...new Set(jobListings.map((j) => j.sector).filter(Boolean))];

  console.log(`[Notify] Sending ${jobListings.length} new job listings to API for company ${companyId}`);

  // API'ye bildirim webhook'u gönder (internal)
  try {
    const res = await fetch(`${API_URL}/internal/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify({
        companyId,
        sector: sectors[0] ?? null,
        jobListings: jobListings.map((j) => ({
          id: j.id,
          title: j.title,
        })),
      }),
    });

    if (res.ok) {
      console.log(`[Notify] Notification dispatched successfully`);
    } else {
      console.warn(`[Notify] API responded with ${res.status}`);
    }
  } catch (err) {
    console.warn(`[Notify] Failed to call API: ${(err as Error).message}`);
  }
}
