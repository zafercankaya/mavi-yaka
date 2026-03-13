import { useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/api';
import { useAuthStore } from '../store/auth';

interface AnalyticsEvent {
  event: string;
  params?: Record<string, any>;
  timestamp: string;
}

const FLUSH_INTERVAL = 30_000; // 30 seconds
const MAX_BATCH = 50;

let queue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

async function flush() {
  if (queue.length === 0) return;

  const batch = queue.splice(0, MAX_BATCH);
  const token = useAuthStore.getState().accessToken;

  try {
    await fetch(`${API_BASE_URL}/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ events: batch }),
    });
  } catch {
    // Re-queue on failure (drop if too many)
    if (queue.length < 200) {
      queue.unshift(...batch);
    }
  }
}

function startFlushTimer() {
  if (flushTimer) return;
  flushTimer = setInterval(flush, FLUSH_INTERVAL);
}

function track(event: string, params?: Record<string, any>) {
  queue.push({
    event,
    params: { ...params, platform: Platform.OS },
    timestamp: new Date().toISOString(),
  });

  startFlushTimer();

  // Auto-flush when batch is full
  if (queue.length >= MAX_BATCH) {
    flush();
  }
}

export function trackEvent(event: string, params?: Record<string, any>) {
  track(event, params);
}

export function useAnalytics() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      startFlushTimer();
    }

    return () => {
      // Flush remaining events on unmount
      flush();
    };
  }, []);

  const logEvent = useCallback((event: string, params?: Record<string, any>) => {
    track(event, params);
  }, []);

  return { logEvent };
}
