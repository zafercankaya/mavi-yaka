import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

/**
 * Serves Apple App Site Association and Android Asset Links
 * for Universal Links / App Links deep linking.
 */
@Controller('.well-known')
export class WellKnownController {
  @Get('apple-app-site-association')
  appleAppSiteAssociation(@Res() res: Response) {
    const aasa = {
      applinks: {
        apps: [],
        details: [
          {
            appID: 'TEAMID.com.maviyaka.app',
            paths: ['/share/j/*'],
          },
        ],
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.json(aasa);
  }

  @Get('assetlinks.json')
  assetLinks(@Res() res: Response) {
    const assetlinks = [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'com.maviyaka.app',
          sha256_cert_fingerprints: [
            // EAS managed signing - get fingerprint from Play Console
          ],
        },
      },
    ];

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.json(assetlinks);
  }
}
