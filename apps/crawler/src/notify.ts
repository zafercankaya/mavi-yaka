import { PrismaClient } from '@prisma/client';

const API_URL = process.env.API_URL || 'http://localhost:3000';

/**
 * Crawl sonrası yeni bulunan kampanyalar için API'ye bildirim isteği gönderir.
 * API tarafındaki NotificationsService Expo Push üzerinden bildirim gönderir.
 */
export async function notifyNewCampaigns(
  prisma: PrismaClient,
  brandId: string,
  newCampaignIds: string[],
): Promise<void> {
  if (newCampaignIds.length === 0) return;

  // DB'den yeni kampanya detaylarını al
  const campaigns = await prisma.campaign.findMany({
    where: { id: { in: newCampaignIds } },
    select: { id: true, title: true, discountRate: true, categoryId: true },
  });

  if (campaigns.length === 0) return;

  // Kategori ID'lerini topla (brand'in kategorisi de dahil)
  const categoryIds = [...new Set(campaigns.map((c) => c.categoryId).filter(Boolean))];

  console.log(`[Notify] Sending ${campaigns.length} new campaigns to API for brand ${brandId}`);

  // API'ye bildirim webhook'u gönder (internal)
  try {
    const res = await fetch(`${API_URL}/internal/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify({
        brandId,
        categoryId: categoryIds[0] ?? null,
        campaigns: campaigns.map((c) => ({
          id: c.id,
          title: c.title,
          discountRate: c.discountRate ? Number(c.discountRate) : null,
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
