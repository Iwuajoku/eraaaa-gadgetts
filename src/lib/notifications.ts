import type { AdminNotification, Order } from '../types';

/**
 * Universal & Background Push Notification Service
 * Ensures notifications are synchronized in real-time across ALL devices
 * (laptops, phones, tablets) just like WhatsApp on PC and mobile.
 */

export interface AppNotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
  badge?: string;
}

/**
 * Converts VAPID URL-safe base64 string to a Uint8Array for PushManager subscription
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Synthesizes a crisp, bright, 3-tone classic app chime (D5 -> A5 -> D6)
 */
export function playClassicNotificationSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const tones = [
      { freq: 587.33, start: 0.0, duration: 0.22, gain: 0.22 },
      { freq: 880.0, start: 0.1, duration: 0.28, gain: 0.28 },
      { freq: 1174.66, start: 0.22, duration: 0.6, gain: 0.32 }
    ];

    tones.forEach((tone) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone.freq, now + tone.start);

      gain.gain.setValueAtTime(tone.gain, now + tone.start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + tone.start + tone.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + tone.start);
      osc.stop(now + tone.start + tone.duration);
    });
  } catch (e) {
    console.debug('[Notifications] Audio chime notice:', e);
  }
}

/**
 * Triggers mobile device haptic vibration
 */
export function vibrateDevice(): void {
  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate([250, 100, 250, 100, 250]);
    }
  } catch (_) {}
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Registers device with the server for universal background Web Push notifications.
 * This ensures the phone wakes up and receives alerts even when the screen is locked
 * or the user is inside other applications!
 */
export async function subscribeDeviceToPush(): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, error: 'Push notifications are not supported on this browser/device.' };
  }

  try {
    // 1. Request permission
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      return { success: false, error: 'Notification permission was declined.' };
    }

    // 2. Register / retrieve service worker
    const reg = await navigator.serviceWorker.ready;

    // 3. Fetch VAPID public key from backend
    const keyRes = await fetch('/api/notifications/vapid-public-key');
    if (!keyRes.ok) throw new Error('Failed to retrieve push key from server');
    const { publicKey } = await keyRes.json();

    // 4. Subscribe with browser PushManager
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any
      });
    }

    // 5. Send subscription endpoint to backend database
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const subRes = await fetch('/api/notifications/push-subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer era_token_9f81a7b2c4e6'
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        deviceType: isMobile ? 'mobile' : 'desktop'
      })
    });

    if (!subRes.ok) {
      throw new Error('Failed to save device subscription on server');
    }

    console.log('[UniversalPush] Device subscribed successfully for background notifications.');
    return { success: true };
  } catch (err: any) {
    console.error('[UniversalPush] Subscribe error:', err);
    return { success: false, error: err?.message || 'Failed to subscribe device' };
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const result = await subscribeDeviceToPush();
  return result.success;
}

/**
 * Shows immediate native notification banner
 */
export async function showClassicNotification(payload: AppNotificationPayload): Promise<boolean> {
  playClassicNotificationSound();
  vibrateDevice();

  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const options: NotificationOptions = {
    body: payload.body,
    icon: payload.icon || '/logo.png',
    badge: payload.badge || '/favicon-32x32.png',
    tag: payload.tag || `era-notif-${Date.now()}`,
    data: {
      url: payload.url || '/admin?tab=orders'
    }
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(payload.title, options);
        return true;
      }
    }
  } catch (_) {}

  try {
    const notif = new Notification(payload.title, options);
    notif.onclick = () => {
      window.focus();
      if (payload.url) {
        window.location.hash = payload.url;
      }
      notif.close();
    };
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Connects to the real-time SSE stream for universal, sub-second sync across laptop & phone
 */
export function startUniversalNotificationStream(
  onNotification: (notif: AdminNotification, order?: Order) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  let eventSource: EventSource | null = null;
  let broadcastChannel: BroadcastChannel | null = null;
  let isClosed = false;

  // 1. Cross-tab BroadcastChannel for instant local syncing
  try {
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('era_universal_notifications');
      broadcastChannel.onmessage = (event) => {
        if (event.data?.notification) {
          onNotification(event.data.notification, event.data.order);
        }
      };
    }
  } catch (_) {}

  // 2. Listen for messages from Service Worker (background push wakeups)
  const handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data?.type === 'UNIVERSAL_PUSH_RECEIVED' && event.data?.notification) {
      const data = event.data.notification;
      const notif: AdminNotification = {
        id: data.id || `notif-sw-${Date.now()}`,
        title: data.title,
        message: data.body,
        type: data.type || 'order',
        orderId: data.orderId,
        read: false,
        createdAt: data.timestamp || new Date().toISOString()
      };
      playClassicNotificationSound();
      vibrateDevice();
      onNotification(notif);
    }
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
  }

  // 3. Connect to live Server-Sent Events (SSE) Stream
  const connectSSE = () => {
    if (isClosed) return;

    const streamUrl = `/api/notifications/stream?admin_token=era_token_9f81a7b2c4e6`;
    eventSource = new EventSource(streamUrl);

    eventSource.addEventListener('notification', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload?.notification) {
          playClassicNotificationSound();
          vibrateDevice();

          // If document is hidden/backgrounded, trigger native OS notification
          if (document.hidden) {
            showClassicNotification({
              title: payload.notification.title,
              body: payload.notification.message,
              url: payload.notification.link || (payload.notification.orderId ? `/admin?tab=orders&orderId=${payload.notification.orderId}` : '/admin')
            });
          }

          onNotification(payload.notification, payload.order);

          // Broadcast to other tabs on this device
          broadcastChannel?.postMessage(payload);
        }
      } catch (err) {
        console.warn('[SSE] Error parsing notification:', err);
      }
    });

    eventSource.onerror = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      // Reconnect after 4 seconds
      if (!isClosed) {
        setTimeout(connectSSE, 4000);
      }
    };
  };

  connectSSE();

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (broadcastChannel) {
      broadcastChannel.close();
      broadcastChannel = null;
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    }
  };
}

/**
 * Triggers a live universal broadcast test that delivers to ALL open screens
 * and wakes up all background phones and laptops!
 */
export async function triggerUniversalTestBroadcast(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/notifications/test-broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer era_token_9f81a7b2c4e6'
      }
    });
    if (!res.ok) throw new Error('Failed to broadcast test');
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err?.message || 'Broadcast failed' };
  }
}
