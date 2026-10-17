import webpush from 'web-push';
import type { Response } from 'express';
import type { AdminNotification, Order } from '../src/types.ts';
import { db } from './db.ts';

// Standard VAPID Configuration for Universal Web Push
export const VAPID_PUBLIC_KEY =
  'BD2Pwsp7eMPphtoTWoUkdtA6RQE0tSrJKpHLeCa7vsK9bC9in13mjloBVoFv6sadaaXuY6OWzGZzWcFq0F6RKYc';
const VAPID_PRIVATE_KEY =
  'mICguSrFIDY9lsQLkqWeuCAVaP7scONvDuh4RLGNNHQ';
const VAPID_SUBJECT = 'mailto:primeculturehomes@gmail.com';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('[WebPush] VAPID configuration successfully initialized.');
} catch (err) {
  console.error('[WebPush] VAPID configuration error:', err);
}

// Active SSE client connections across all devices (laptops, phones, tablets)
const sseClients = new Set<Response>();

/**
 * Registers an active SSE client stream (Real-Time universal sync across all devices)
 */
export function registerSSEClient(res: Response): () => void {
  sseClients.add(res);

  // Send initial connected event
  res.write(`event: connected\ndata: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);

  const unregister = () => {
    sseClients.delete(res);
  };

  return unregister;
}

/**
 * Broadcasts an event to all open devices in real-time (instant sub-second sync)
 */
export function broadcastSSE(eventName: string, data: any): void {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (_) {
      sseClients.delete(client);
    }
  }
}

// Heartbeat ping every 25 seconds to keep SSE streams alive through proxies and mobile networks
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': ping\n\n');
    } catch (_) {
      sseClients.delete(client);
    }
  }
}, 25000);

/**
 * Dispatches universal notifications to ALL devices:
 * 1. Immediate 0ms Real-Time broadcast via SSE to all open phones and laptops
 * 2. Background OS Web Push via Service Worker to all registered mobile and desktop devices
 */
export async function dispatchUniversalNotification(
  notification: AdminNotification,
  extra?: { order?: Order }
): Promise<{ sseCount: number; pushCount: number }> {
  // 1. Instant Real-time Broadcast across all connected screens (phone, laptop, tablet)
  broadcastSSE('notification', {
    notification,
    order: extra?.order
  });

  const activeSseCount = sseClients.size;

  // 2. Background Web Push to all registered device subscriptions
  const subscriptions = db.getPushSubscriptions();
  let successfulPush = 0;

  if (subscriptions.length > 0) {
    const pushPayload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      url: notification.link || (notification.orderId ? `/admin?tab=orders&orderId=${notification.orderId}` : '/admin'),
      id: notification.id,
      type: notification.type,
      orderId: notification.orderId,
      timestamp: notification.createdAt
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth
            }
          },
          pushPayload,
          {
            TTL: 86400, // 24 hours
            urgency: 'high'
          }
        );
        successfulPush++;
      } catch (err: any) {
        // If expired or unregistered, cleanly remove dead subscription
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          console.log('[WebPush] Removing expired device subscription:', sub.endpoint.slice(-16));
          db.removePushSubscription(sub.endpoint);
        } else {
          console.debug('[WebPush] Dispatch note for endpoint:', err?.message || err);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  }

  console.log(
    `[UniversalNotification] "${notification.title}" delivered to ${activeSseCount} active screen(s) and ${successfulPush}/${subscriptions.length} background device(s).`
  );

  return { sseCount: activeSseCount, pushCount: successfulPush };
}
