<script setup lang="ts">
useHead({ title: 'Nuxt Push Notifications' });

const { $pwa } = useNuxtApp();
const runtimeConfig = useRuntimeConfig();
const toast = useToast();
const queryClient = useQueryClient();
const notificationAccess = usePermission('notifications');

const { data: isSubscribed, isFetching: isSubscribedFetching } = useQuery({
  queryKey: ['subscribed', notificationAccess],
  queryFn: async () => {
    if (!$pwa) return false;

    const isGranted = notificationAccess.value === 'granted';

    if (!isGranted) return false;

    const registration = $pwa.getSWRegistration();

    if (!registration) return false;

    const vapidPublicKey = runtimeConfig.public.push.vapidPublicKey;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const getAuthKey = () => {
      const json = subscription.toJSON();
      const authKey = json.keys?.['auth'];
      return typeof authKey === 'string' ? authKey : '';
    };

    const authKey = getAuthKey();

    if (!authKey) return false;

    return $fetch(`/api/notifications/subscribed/${authKey}`);
  },
});

const { isPending: isSubscribePending, mutateAsync: subscribeMutate } =
  useMutation({
    mutationKey: ['subscribe'],
    mutationFn: async () => {
      if (!$pwa) {
        throw new Error('PWA module is not available');
      }

      const isServiceWorkerAvailable = 'serviceWorker' in navigator;
      const isPushManagerAvailable = 'PushManager' in window;

      if (!isServiceWorkerAvailable || !isPushManagerAvailable) {
        throw new Error('Service Worker or Push Manager is not available');
      }

      const permission = await Notification.requestPermission();

      const isGranted = permission === 'granted';

      if (!isGranted) {
        throw new Error('Permission not granted');
      }

      const registration = $pwa.getSWRegistration();

      if (!registration) {
        throw new Error('Service Worker registration is not available');
      }

      const vapidPublicKey = runtimeConfig.public.push.vapidPublicKey;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const result = await $fetch('/api/notifications/subscribe', {
        method: 'POST',
        body: subscription,
      });

      if (!result.success) throw new Error('Subscription not saved');

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribed'] });
      toast.add({ title: 'Subscribed to push notifications', color: 'green' });
    },
    onError: (error) => {
      toast.add({ title: error.message, color: 'red' });
    },
  });

const {
  isPending: isSendNotificationPending,
  mutateAsync: sendNotificationMutate,
} = useMutation({
  mutationKey: ['sendNotification'],
  mutationFn: async (message: string) => {
    if (!message) {
      throw new Error('Message is required');
    }

    const result = await $fetch('/api/notifications/send', {
      method: 'POST',
      body: {
        title: message,
        data: { url: runtimeConfig.public.siteUrl },
      },
    });

    if (!result.success) throw new Error('Notification not sent');

    return result;
  },
  onSuccess: () => {
    toast.add({ title: 'Notification sent', color: 'green' });
  },
  onError: (error) => {
    toast.add({ title: error.message, color: 'red' });
  },
});

const message = ref('');

const sendNotification = async () => {
  await sendNotificationMutate(message.value);

  message.value = '';
};
</script>

<template>
  <UContainer class="flex flex-col gap-6 p-6">
    <h1 class="text-2xl font-bold">Nuxt Push Notifications</h1>

    <UCard :ui="{ body: { base: 'flex flex-col gap-3' } }">
      <h2 class="text-xl font-semibold">Push Notifications</h2>

      <ClientOnly>
        <div>Notifications access: {{ notificationAccess }}</div>

        <div>
          Subscribed to push notifications:
          {{ isSubscribedFetching ? 'loading...' : isSubscribed }}
        </div>

        <UButton
          :disabled="isSubscribePending || isSubscribedFetching || isSubscribed"
          :loading="isSubscribePending || isSubscribedFetching"
          class="self-start"
          @click="subscribeMutate"
        >
          Subscribe to Push Notifications
        </UButton>
      </ClientOnly>
    </UCard>

    <UCard :ui="{ body: { base: 'flex flex-col gap-3' } }">
      <h2 class="text-xl font-semibold">Send Push Notification</h2>

      <form class="flex gap-3" @submit.prevent="sendNotification">
        <UInput
          v-model="message"
          :disabled="isSendNotificationPending"
          size="lg"
          placeholder="Message..."
          class="grow"
        />

        <UButton
          type="submit"
          :disabled="isSendNotificationPending"
          :loading="isSendNotificationPending"
        >
          Send Push Notification
        </UButton>
      </form>
    </UCard>
  </UContainer>

  <UNotifications />
  <NuxtPwaAssets />
</template>
