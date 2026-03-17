import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Expo, { ExpoPushMessage, ExpoPushTicket, ExpoPushReceiptId } from 'expo-server-sdk';

@Injectable()
export class ExpoPushService implements OnModuleInit {
  private readonly logger = new Logger(ExpoPushService.name);
  private expo!: Expo;

  onModuleInit() {
    this.expo = new Expo();
    this.logger.log('Expo Push Service initialized');
  }

  get isEnabled(): boolean {
    return true; // Expo push service is always available (no credentials needed)
  }

  /**
   * Send push notifications to Expo Push Tokens.
   * Returns the list of invalid/failed tokens for cleanup.
   */
  async sendToTokens(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ success: number; failure: number; invalidTokens: string[] }> {
    if (tokens.length === 0) {
      return { success: 0, failure: 0, invalidTokens: [] };
    }

    // Filter valid Expo Push Tokens
    const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t));
    const invalidTokens = tokens.filter((t) => !Expo.isExpoPushToken(t));

    if (invalidTokens.length > 0) {
      this.logger.warn(`${invalidTokens.length} invalid Expo Push Tokens filtered out`);
    }

    if (validTokens.length === 0) {
      return { success: 0, failure: tokens.length, invalidTokens };
    }

    // Build messages
    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      title,
      body,
      data,
      sound: 'default' as const,
      channelId: 'jobs',
      priority: 'high' as const,
    }));

    // Chunk messages (Expo recommends max 100 per request)
    const chunks = this.expo.chunkPushNotifications(messages);
    let successCount = 0;
    let failureCount = 0;
    const failedTokens: string[] = [...invalidTokens];

    for (const chunk of chunks) {
      try {
        const tickets: ExpoPushTicket[] = await this.expo.sendPushNotificationsAsync(chunk);

        for (let i = 0; i < tickets.length; i++) {
          const ticket = tickets[i];
          if (ticket.status === 'ok') {
            successCount++;
          } else {
            failureCount++;
            // DeviceNotRegistered = stale token, should be removed
            if (ticket.details?.error === 'DeviceNotRegistered') {
              failedTokens.push(validTokens[i]);
            }
          }
        }
      } catch (err) {
        this.logger.error('Expo push chunk send error', (err as Error).message);
        failureCount += chunk.length;
      }
    }

    this.logger.log(`Push sent: ${successCount} ok, ${failureCount} failed`);
    return { success: successCount, failure: failureCount, invalidTokens: failedTokens };
  }
}
