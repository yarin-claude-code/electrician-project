import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist, CacheFirst, StaleWhileRevalidate, NetworkFirst, ExpirationPlugin } from 'serwist'

// This is injected by @serwist/next during build
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: WorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: new CacheFirst({ cacheName: 'google-fonts-webfonts', plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 })] }),
    },
    {
      matcher: /\/_next\/static\/.*/i,
      handler: new CacheFirst({ cacheName: 'next-static', plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 })] }),
    },
    {
      matcher: /\/_next\/image\?.*/i,
      handler: new StaleWhileRevalidate({ cacheName: 'next-image', plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 })] }),
    },
    {
      // Cache dashboard and inspection pages for offline access
      matcher: ({ request }: { request: Request }) => request.destination === 'document',
      handler: new NetworkFirst({ cacheName: 'pages', plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 })], networkTimeoutSeconds: 5 }),
    },
    // Supabase REST responses are NOT cached — they contain user-specific auth data
    // and caching them risks serving stale data to the next user on the same browser.
    // Offline data is handled by IndexedDB (idb.ts) instead.
  ],
})

serwist.addEventListeners()
