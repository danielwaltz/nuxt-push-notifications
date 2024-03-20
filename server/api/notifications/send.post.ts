import 'webcrypto-liner';
import webpush, { WebPushError, type PushSubscription } from 'web-push';
import * as v from 'valibot';

const BodySchema = v.object({
  title: v.string(),
  badge: v.optional(v.string()),
  body: v.optional(v.string()),
  data: v.optional(v.object({ url: v.optional(v.string()) })),
  icon: v.optional(v.string()),
  lang: v.optional(v.string()),
  requireInteraction: v.optional(v.boolean()),
  silent: v.optional(v.boolean()),
  tag: v.optional(v.string()),
});

const validate = (data: unknown) => v.parse(BodySchema, data);

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, validate);

  const runtimeConfig = useRuntimeConfig();

  const email = 'mailto:noreply@example.com';
  const publicKey = runtimeConfig.public.push.vapidPublicKey;
  const privateKey = runtimeConfig.push.vapidPrivateKey;

  webpush.setVapidDetails(email, publicKey, privateKey);

  const storage = useStorage('db');

  const keys = await storage.getKeys('subscription');

  for (const key of keys) {
    const subscription = await storage.getItem<PushSubscription>(key);

    if (!subscription) continue;

    try {
      await webpush.sendNotification(subscription, JSON.stringify(body));
    } catch (error) {
      if (!(error instanceof WebPushError)) throw error;

      const isGone = error.statusCode === 410;

      if (!isGone) throw error;

      await storage.removeItem(key);
    }
  }

  setResponseStatus(event, 201);

  return { success: true };
});
