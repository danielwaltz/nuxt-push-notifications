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

const subscribe = async () => {
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
    <div>
      <div>Notifications access: {{ notificationAccess }}</div>

      <button @click="subscribe">Subscribe to Push Notifications</button>

      <form @submit.prevent="send">
        <input v-model="message" />
        <button type="submit">Send Push Notification</button>
      </form>

      <div v-if="error">{{ error }}</div>
    </div>
  </ClientOnly>

  <NuxtPwaAssets />
</template>
