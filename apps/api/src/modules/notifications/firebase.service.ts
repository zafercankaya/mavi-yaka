import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App | null = null;

  onModuleInit() {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountJson) {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT not set — push notifications disabled');
      return;
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      this.logger.log('Firebase Admin initialized');
    } catch (err) {
      this.logger.error('Firebase Admin init failed', (err as Error).message);
    }
  }

  get isEnabled(): boolean {
    return this.app !== null;
  }

  async sendToTokens(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ success: number; failure: number }> {
    if (!this.app || tokens.length === 0) {
      return { success: 0, failure: 0 };
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: { title, body },
      data,
      android: {
        notification: { channelId: 'campaigns', priority: 'high' },
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
      },
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(`Push sent: ${response.successCount} ok, ${response.failureCount} failed`);
      return { success: response.successCount, failure: response.failureCount };
    } catch (err) {
      this.logger.error('Push send error', (err as Error).message);
      return { success: 0, failure: tokens.length };
    }
  }
}
