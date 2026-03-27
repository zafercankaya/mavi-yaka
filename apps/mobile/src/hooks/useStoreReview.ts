import { useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as StoreReview from 'expo-store-review';
import i18next from 'i18next';

// ─── Config ─────────────────────────────────────────────
const KEYS = {
  POSITIVE_ACTION_COUNT: 'review_positive_actions',
  LAST_REVIEW_PROMPT: 'review_last_prompt_ts',
  DISMISSED_FOREVER: 'review_dismissed_forever',
  APP_OPEN_COUNT: 'review_app_open_count',
};

/** Minimum positive actions before asking */
const MIN_POSITIVE_ACTIONS = 3;
/** Cooldown between prompts (30 days) */
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
/** Feedback email */
const FEEDBACK_EMAIL = 'zafer.cankaya@gmail.com';

// ─── Internal helpers ───────────────────────────────────

async function canShowReview(): Promise<boolean> {
  // Permanently dismissed?
  const dismissed = await SecureStore.getItemAsync(KEYS.DISMISSED_FOREVER);
  if (dismissed === 'true') return false;

  // Store review API available?
  if (!(await StoreReview.isAvailableAsync())) return false;

  // Cooldown check
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

async function dismissForever(): Promise<void> {
  await SecureStore.setItemAsync(KEYS.DISMISSED_FOREVER, 'true');
}

function openFeedbackEmail(): void {
  const subject = encodeURIComponent('Mavi Yaka App Feedback');
  Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=${subject}`);
}

// ─── Happy Path Routing ─────────────────────────────────

/**
 * Shows "Are you enjoying the app?" dialog.
 * YES → native store review prompt (5 stars likely)
 * NO  → mailto feedback (complaint goes to email, not store)
 */
async function showHappyPathDialog(): Promise<void> {
  const t = i18next.t.bind(i18next);

  return new Promise<void>((resolve) => {
    Alert.alert(
      t('review.title', { defaultValue: 'Enjoying Mavi Yaka?' }),
      t('review.subtitle', { defaultValue: 'Your feedback helps us improve!' }),
      [
        {
          text: t('review.notReally', { defaultValue: 'Not really' }),
          style: 'cancel',
          onPress: async () => {
            // Negative → open email, dismiss forever
            await dismissForever();
            openFeedbackEmail();
            resolve();
          },
        },
        {
          text: t('review.yesLovingIt', { defaultValue: 'Yes, loving it!' }),
          onPress: async () => {
            // Positive → native store review
            await recordPrompt();
            await StoreReview.requestReview();
            resolve();
          },
        },
      ],
      { cancelable: false },
    );
  });
}

// ─── Public API ─────────────────────────────────────────

/**
 * Call from _layout.tsx on mount. Increments open counter.
 * No longer triggers review on open — only on positive engagement.
 */
export function useStoreReviewInit() {
  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(KEYS.APP_OPEN_COUNT);
        const count = (parseInt(raw ?? '0', 10) || 0) + 1;
        await SecureStore.setItemAsync(KEYS.APP_OPEN_COUNT, count.toString());
      } catch {}
    })();
  }, []);
}

/**
 * Call after positive user engagement (save job, follow company, apply).
 * Increments positive action counter. After MIN_POSITIVE_ACTIONS,
 * shows Happy Path dialog if cooldown allows.
 *
 * Happy Path Routing:
 * - "Enjoying the app?" → YES → Store review (5 stars likely)
 * - "Enjoying the app?" → NO  → mailto feedback (no store damage)
 * - Dismissed once → never shown again (store policy)
 */
export async function maybeRequestReview(): Promise<void> {
  try {
    // Increment positive action count
    const raw = await SecureStore.getItemAsync(KEYS.POSITIVE_ACTION_COUNT);
    const count = (parseInt(raw ?? '0', 10) || 0) + 1;
    await SecureStore.setItemAsync(KEYS.POSITIVE_ACTION_COUNT, count.toString());

    // Not enough positive actions yet?
    if (count < MIN_POSITIVE_ACTIONS) return;

    // Check cooldown + dismissal
    if (!(await canShowReview())) return;

    // Show happy path dialog
    await showHappyPathDialog();
  } catch {}
}
