import webpush, { WebPushError, type PushSubscription } from 'web-push';

const NotificationOptionsSchema = v.object({
  badge: v.string(),
  body: v.string(),
  data: v.object({ url: v.string() }),
  dir: v.picklist(['auto', 'ltr', 'rtl']),
  icon: v.string(),
  lang: v.string(),
  requireInteraction: v.boolean(),
  silent: v.boolean(),
  tag: v.string(),
});

const BodySchema = v.merge([
  v.object({ title: v.string() }),
  v.partial(NotificationOptionsSchema),
]);

const validate = (data: unknown) => v.parse(BodySchema, data);

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, validate);

  const runtimeConfig = useRuntimeConfig();

  const email = 'mailto:noreply@example.com';
  const publicKey = runtimeConfig.public.push.vapidPublicKey;
  const privateKey = runtimeConfig.push.vapidPrivateKey;

  if (!publicKey || !privateKey) throw new Error('VAPID keys are not set');

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

  return { success: true };
});
