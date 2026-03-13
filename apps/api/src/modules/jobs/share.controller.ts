import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('share')
export class ShareController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /share/j/:id — Job share redirect with OG preview
   * Web browsers: render HTML with OG tags + store links
   * Mobile apps: deep link to maviyaka://job/:id
   */
  @Get('j/:id')
  async shareJob(@Param('id') id: string, @Res() res: Response) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        sourceUrl: true,
        city: true,
        state: true,
        country: true,
        company: { select: { name: true, market: true } },
      },
    });

    if (!job) {
      return res.redirect('https://maviyaka.com');
    }

    const market = (job.country || job.company?.market || 'tr').toString().toLowerCase();
    const companyName = job.company?.name || '';
    const title = job.title || 'Job Listing';
    const location = [job.city, job.state].filter(Boolean).join(', ');
    const description = job.description
      ? job.description.slice(0, 200)
      : `${companyName}${location ? ` - ${location}` : ''} - ${title}`;
    const image = job.imageUrl || 'https://maviyaka.com/images/og-image.png';
    const deepLink = `maviyaka://job/${id}`;
    const webUrl = `https://maviyaka.com/${market}`;
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.maviyaka.app';
    const appStoreUrl = 'https://apps.apple.com/app/mavi-yaka/id0000000000';

    const intentUrl = `intent://job/${id}#Intent;scheme=maviyaka;package=com.maviyaka.app;S.browser_fallback_url=${encodeURIComponent(playStoreUrl)};end`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} - ${escapeHtml(companyName)}</title>
  <meta property="og:title" content="${escapeAttr(title)}" />
  <meta property="og:description" content="${escapeAttr(description)}" />
  <meta property="og:image" content="${escapeAttr(image)}" />
  <meta property="og:url" content="https://api.maviyaka.com/share/j/${id}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="MaviYaka.iş" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeAttr(title)}" />
  <meta name="twitter:description" content="${escapeAttr(description)}" />
  <meta name="twitter:image" content="${escapeAttr(image)}" />
  <meta name="al:android:url" content="${deepLink}" />
  <meta name="al:android:package" content="com.maviyaka.app" />
  <meta name="al:android:app_name" content="MaviYaka.iş" />
  <meta name="al:ios:url" content="${deepLink}" />
  <meta name="al:ios:app_store_id" content="0000000000" />
  <meta name="al:ios:app_name" content="MaviYaka.iş" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px; text-align: center; background: #fff; }
    .card { max-width: 480px; margin: 0 auto; padding: 32px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,.1); }
    h1 { font-size: 24px; color: #111; margin-bottom: 8px; }
    .company { color: #2563eb; font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .location { color: #888; font-size: 14px; margin-bottom: 16px; }
    .desc { color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 24px; }
    img.job-img { width: 100%; max-height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 16px; }
    .buttons { display: flex; flex-direction: column; gap: 12px; }
    .btn { display: block; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #f3f4f6; color: #111; }
  </style>
</head>
<body>
  <div class="card">
    ${image !== 'https://maviyaka.com/images/og-image.png' ? `<img class="job-img" src="${escapeAttr(image)}" alt="${escapeAttr(title)}" />` : ''}
    <div class="company">${escapeHtml(companyName)}</div>
    <h1>${escapeHtml(title)}</h1>
    ${location ? `<div class="location">${escapeHtml(location)}</div>` : ''}
    <p class="desc">${escapeHtml(description)}</p>
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
