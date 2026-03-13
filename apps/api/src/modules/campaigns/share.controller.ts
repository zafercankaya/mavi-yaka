import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('share')
export class ShareController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /share/c/:id — Campaign share redirect with OG preview
   * Web browsers: render HTML with OG tags + store links
   * Mobile apps: deep link to kampanya://campaign/:id
   */
  @Get('c/:id')
  async shareCampaign(@Param('id') id: string, @Res() res: Response) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrls: true,
        sourceUrl: true,
        brand: { select: { name: true, market: true } },
      },
    });

    if (!campaign) {
      return res.redirect('https://kampanyasepeti.com');
    }

    const market = campaign.brand?.market?.toLowerCase() || 'tr';
    const brandName = campaign.brand?.name || '';
    const title = campaign.title || 'Deal';
    const description = campaign.description || `${brandName} - ${title}`;
    const image = campaign.imageUrls?.[0] || 'https://kampanyasepeti.com/images/og-image.png';
    const deepLink = `kampanya://campaign/${id}`;
    const webUrl = `https://kampanyasepeti.com/${market}`;
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.kampanyasepeti.app';
    const appStoreUrl = 'https://apps.apple.com/app/kampanya-sepeti/id6760295416';

    const intentUrl = `intent://campaign/${id}#Intent;scheme=kampanya;package=com.kampanyasepeti.app;S.browser_fallback_url=${encodeURIComponent(playStoreUrl)};end`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} - ${escapeHtml(brandName)}</title>
  <meta property="og:title" content="${escapeAttr(title)}" />
  <meta property="og:description" content="${escapeAttr(description.slice(0, 200))}" />
  <meta property="og:image" content="${escapeAttr(image)}" />
  <meta property="og:url" content="https://kampanya-sepeti-api-3c9f.onrender.com/share/c/${id}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Deal Box" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeAttr(title)}" />
  <meta name="twitter:description" content="${escapeAttr(description.slice(0, 200))}" />
  <meta name="twitter:image" content="${escapeAttr(image)}" />
  <meta name="al:android:url" content="${deepLink}" />
  <meta name="al:android:package" content="com.kampanyasepeti.app" />
  <meta name="al:android:app_name" content="Deal Box" />
  <meta name="al:ios:url" content="${deepLink}" />
  <meta name="al:ios:app_store_id" content="6760295416" />
  <meta name="al:ios:app_name" content="Deal Box" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px; text-align: center; background: #fff; }
    .card { max-width: 480px; margin: 0 auto; padding: 32px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,.1); }
    h1 { font-size: 24px; color: #111; margin-bottom: 8px; }
    .brand { color: #f97316; font-size: 16px; font-weight: 600; margin-bottom: 16px; }
    .desc { color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 24px; }
    img.campaign-img { width: 100%; max-height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 16px; }
    .buttons { display: flex; flex-direction: column; gap: 12px; }
    .btn { display: block; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; }
    .btn-primary { background: #f97316; color: white; }
    .btn-secondary { background: #f3f4f6; color: #111; }
  </style>
</head>
<body>
  <div class="card">
    ${image !== 'https://kampanyasepeti.com/images/og-image.png' ? `<img class="campaign-img" src="${escapeAttr(image)}" alt="${escapeAttr(title)}" />` : ''}
    <div class="brand">${escapeHtml(brandName)}</div>
    <h1>${escapeHtml(title)}</h1>
    <p class="desc">${escapeHtml(description.slice(0, 300))}</p>
    <div class="buttons">
      <a class="btn btn-primary" id="open-btn" href="${appStoreUrl}">Open in App</a>
      <a class="btn btn-secondary" id="store-btn" href="${playStoreUrl}">Get on Google Play</a>
    </div>
  </div>
  <script>
    var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    var isAndroid = /Android/i.test(navigator.userAgent);
    var openBtn = document.getElementById('open-btn');
    var storeBtn = document.getElementById('store-btn');
    if (isAndroid) {
      openBtn.href = "${intentUrl}";
      openBtn.textContent = "Open in App";
      storeBtn.href = "${playStoreUrl}";
      storeBtn.textContent = "Get on Google Play";
    } else if (isIOS) {
      openBtn.href = "${appStoreUrl}";
      openBtn.textContent = "Open in App Store";
      storeBtn.href = "${playStoreUrl}";
      storeBtn.style.display = "none";
    } else {
      openBtn.href = "${webUrl}";
      openBtn.textContent = "View on Web";
      storeBtn.style.display = "none";
    }
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(html);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
