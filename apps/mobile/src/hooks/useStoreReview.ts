import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as StoreReview from 'expo-store-review';

const KEYS = {
  APP_OPEN_COUNT: 'review_app_open_count',
  LAST_REVIEW_PROMPT: 'review_last_prompt_ts',
};

const MIN_OPENS = 3;
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function canShowReview(): Promise<boolean> {
  if (!(await StoreReview.isAvailableAsync())) return false;

  const lastPrompt = await SecureStore.getItemAsync(KEYS.LAST_REVIEW_PROMPT);
  if (lastPrompt) {
    const elapsed = Date.now() - parseInt(lastPrompt, 10);
    if (elapsed < COOLDOWN_MS) return false;
  }
  return true;
}

async function recordPrompt(): Promise<void> {
  await SecureStore.setItemAsync(KEYS.LAST_REVIEW_PROMPT, Date.now().toString());
}

/**
 * Call from _layout.tsx on mount. Increments open counter,
 * triggers review on 3rd open if cooldown allows.
 */
export function useStoreReviewInit() {
  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(KEYS.APP_OPEN_COUNT);
        const count = (parseInt(raw ?? '0', 10) || 0) + 1;
        await SecureStore.setItemAsync(KEYS.APP_OPEN_COUNT, count.toString());

        if (count === MIN_OPENS && (await canShowReview())) {
          await StoreReview.requestReview();
          await recordPrompt();
        }
      } catch {}
    })();
  }, []);
}

/**
 * Call after positive engagement (follow brand, favorite campaign).
 * Only fires if cooldown elapsed and opens >= MIN_OPENS.
 */
export async function maybeRequestReview(): Promise<void> {
  try {
    const raw = await SecureStore.getItemAsync(KEYS.APP_OPEN_COUNT);
    const count = parseInt(raw ?? '0', 10) || 0;
    if (count < MIN_OPENS) return;
    if (!(await canShowReview())) return;

    await StoreReview.requestReview();
    await recordPrompt();
  } catch {}
}
