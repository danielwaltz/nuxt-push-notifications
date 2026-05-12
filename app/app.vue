<script setup lang="ts">
useSeoMeta({ title: "Nuxt Push Notifications" });

const { $pwa } = useNuxtApp();
const runtimeConfig = useRuntimeConfig();
const toast = useToast();
const queryCache = useQueryCache();
const notificationAccess = usePermission("notifications");

const { data: isSubscribed, asyncStatus: subscribedStatus } = useQuery({
  key: ["subscribed", notificationAccess],
  query: async () => {
    if (!$pwa) return false;

    const isGranted = notificationAccess.value === "granted";

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
      const authKey = json.keys?.auth;
      return typeof authKey === "string" ? authKey : "";
    };

    const authKey = getAuthKey();

    if (!authKey) return false;

    return $fetch(`/api/notifications/subscribed/${authKey}`);
  },
});

const { mutateAsync: subscribeMutate, asyncStatus: subscribeStatus } =
  useMutation({
    key: ["subscribe"],
    mutation: async () => {
      if (!$pwa) {
        throw new Error("PWA module is not available");
      }

      const isServiceWorkerAvailable = "serviceWorker" in navigator;
      const isPushManagerAvailable = "PushManager" in globalThis;

      if (!isServiceWorkerAvailable || !isPushManagerAvailable) {
        throw new Error("Service Worker or Push Manager is not available");
      }

      // eslint-disable-next-line baseline-js/use-baseline
      const permission = await Notification.requestPermission();

      const isGranted = permission === "granted";

      if (!isGranted) {
        throw new Error("Permission not granted");
      }

      const registration = $pwa.getSWRegistration();

      if (!registration) {
        throw new Error("Service Worker registration is not available");
      }

      const vapidPublicKey = runtimeConfig.public.push.vapidPublicKey;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const result = await $fetch("/api/notifications/subscribe", {
        method: "POST",
        body: subscription,
      });

      if (!result.success) throw new Error("Subscription not saved");

      return result;
    },
    onSuccess: () => {
      queryCache.invalidateQueries({ key: ["subscribed"] });
      toast.add({
        title: "Subscribed to push notifications",
        color: "success",
      });
    },
    onError: (error) => {
      toast.add({ title: error.message, color: "error" });
    },
  });

const {
  mutateAsync: sendNotificationMutate,
  asyncStatus: sendNotificationStatus,
} = useMutation({
  key: ["sendNotification"],
  mutation: async (message: string) => {
    if (!message) {
      throw new Error("Message is required");
    }

    const result = await $fetch("/api/notifications/send", {
      method: "POST",
      body: {
        title: message,
        data: { url: runtimeConfig.public.siteUrl },
      },
    });

    if (!result.success) throw new Error("Notification not sent");

    return result;
  },
  onSuccess: () => {
    toast.add({ title: "Notification sent", color: "success" });
  },
  onError: (error) => {
    toast.add({ title: error.message, color: "error" });
  },
});

const subscribe = async () => {
  await subscribeMutate();
};

const message = ref("");

const sendNotification = async () => {
  if (!message.value) {
    toast.add({ title: "Message is required", color: "error" });
    return;
  }

  await sendNotificationMutate(message.value);

  message.value = "";
};
</script>

<template>
  <UApp>
    <UContainer class="flex flex-col gap-6 p-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold">Nuxt Push Notifications</h1>

        <NuxtLink
          href="https://github.com/danielwaltz/nuxt-push-notifications"
          external
          class="flex text-2xl"
        >
          <UIcon name="i-simple-icons-github" dynamic />
          <span class="sr-only">View Source on GitHub</span>
        </NuxtLink>
      </div>

      <UCard :ui="{ body: 'flex flex-col gap-3' }">
        <h2 class="text-xl font-semibold">Push Notifications</h2>

        <ClientOnly>
          <div>Notifications access: {{ notificationAccess }}</div>

          <div>
            Subscribed to push notifications:
            {{ subscribedStatus === "loading" ? "loading..." : isSubscribed }}
          </div>

          <UButton
            :disabled="
              subscribeStatus === 'loading' ||
              subscribedStatus === 'loading' ||
              isSubscribed
            "
            :loading="
              subscribeStatus === 'loading' || subscribedStatus === 'loading'
            "
            class="self-start"
            @click="subscribe"
          >
            Subscribe to Push Notifications
          </UButton>
        </ClientOnly>
      </UCard>

      <UCard :ui="{ body: 'flex flex-col gap-3' }">
        <h2 class="text-xl font-semibold">Send Push Notification</h2>

        <form class="flex gap-3" @submit.prevent="sendNotification">
          <UInput
            v-model="message"
            :disabled="sendNotificationStatus === 'loading'"
            size="lg"
            placeholder="Message..."
            class="grow"
          />

          <UButton
            type="submit"
            :disabled="sendNotificationStatus === 'loading'"
            :loading="sendNotificationStatus === 'loading'"
          >
            Send Push Notification
          </UButton>
        </form>
      </UCard>
    </UContainer>

    <NuxtPwaAssets />
  </UApp>
</template>
