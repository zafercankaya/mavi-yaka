export type RevenueCatEventType =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'CANCELLATION'
  | 'UNCANCELLATION'
  | 'NON_RENEWING_PURCHASE'
  | 'SUBSCRIPTION_PAUSED'
  | 'EXPIRATION'
  | 'BILLING_ISSUE'
  | 'PRODUCT_CHANGE';

export interface RevenueCatEvent {
  type: RevenueCatEventType;
  app_user_id: string;
  product_id: string;
  period_type: string;
  purchased_at_ms: number;
  expiration_at_ms: number | null;
  store: 'APP_STORE' | 'PLAY_STORE';
  environment: 'PRODUCTION' | 'SANDBOX';
  original_app_user_id: string;
}

export interface RevenueCatWebhookBody {
  api_version: string;
  event: RevenueCatEvent;
}
