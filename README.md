# Nuxt Push Notifications

This is a simple example of how to use push notifications in a Nuxt 3 application. It uses the [web-push](https://www.npmjs.com/package/web-push) package to send push notifications to the client and Nitro/Unstorage to save subscriptions.

To test, generate a VAPID key pair using the following command `npx web-push@latest generate-vapid-keys` and add the keys to an `.env.local` file:

```bash
NUXT_PUSH_VAPID_PRIVATE_KEY=<private_key>
NUXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY=<public_key>
```

Then run the application and access <http://localhost:3000>. From there you are able to subscribe to push notifications and send a test notification.

# Nuxt

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
npm i
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
