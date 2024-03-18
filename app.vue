<script setup lang="ts">
const { $pwa } = useNuxtApp();
const runtimeConfig = useRuntimeConfig();
const notificationAccess = usePermission('notifications');

const message = ref('Hello!');
const error = ref('');

const handleError = (message: string) => {
  error.value = message;
  console.error(message);
};

const resetError = () => {
  error.value = '';
};

const subscribe = async () => {
  resetError();

  if (!$pwa) {
    handleError('PWA module is not available');
    return;
  }

  const isServiceWorkerAvailable = 'serviceWorker' in navigator;
  const isPushManagerAvailable = 'PushManager' in window;

  if (!isServiceWorkerAvailable || !isPushManagerAvailable) {
    handleError('Service Worker or Push Manager is not available');
    return;
  }

  const permission = await Notification.requestPermission();

  const isGranted = permission === 'granted';

  if (!isGranted) {
    handleError('Permission not granted');
    return;
  }

  const registration = $pwa.getSWRegistration();

  if (!registration) {
    handleError('Service Worker registration is not available');
    return;
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

  if (result.success) {
    console.log('Subscription saved');
  } else {
    handleError('Subscription not saved');
  }
};

const send = async () => {
  resetError();

  const result = await $fetch('/api/notifications/send', {
    method: 'POST',
    body: {
      title: message.value,
      data: { url: 'http://localhost:3000' },
    },
  });

  if (result.success) {
    console.log('Notification sent');
  } else {
    handleError('Notification not sent');
  }
};
</script>

<template>
  <ClientOnly>
    <UContainer class="flex flex-col gap-6 p-6">
      <h1 class="text-2xl font-bold">Nuxt Push Notifications</h1>

      <UCard :ui="{ body: { base: 'flex flex-col gap-3' } }">
        <h2 class="text-xl font-semibold">Push Notifications</h2>

        <div>Notifications access: {{ notificationAccess }}</div>

        <UButton class="self-start" @click="subscribe">
          Subscribe to Push Notifications
        </UButton>
      </UCard>

      <UCard :ui="{ body: { base: 'flex flex-col gap-3' } }">
        <h2 class="text-xl font-semibold">Send Push Notification</h2>

        <form class="flex gap-3" @submit.prevent="send">
          <UInput v-model="message" class="grow" />
          <UButton type="submit">Send Push Notification</UButton>
        </form>
      </UCard>

      <UAlert v-if="error" :title="error" color="red" />
    </UContainer>
  </ClientOnly>

  <NuxtPwaAssets />
</template>
