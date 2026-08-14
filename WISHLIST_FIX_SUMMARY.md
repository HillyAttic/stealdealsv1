# Wishlist API Error — Root Cause Analysis & Fix

## Error (Original)
```
POST /api/user/wishlist 500 (Internal Server Error)
Error: Cannot find package '@/lib' imported from D:\stealdealsv1\.next\server\app\api\user\wishlist\route.js
```

## Error (After first fix attempt)
```
Module not found: Can't resolve 'http2'
UnhandledSchemeError: Reading from "node:events" / "node:process" / "node:stream" / "node:util" is not handled by plugins

Import trace:
./node_modules/firebase-admin/lib/...
./src/lib/firebase-server-admin.ts
./src/lib/database/firestore-wishlist-admin.ts
./src/lib/database/firestore-wishlist.ts
./src/contexts/EnhancedWishlistContext.tsx   <-- CLIENT
./src/app/providers.tsx
```

---

## The Real Architecture (Why This Was Tricky)

`src/lib/database/firestore-wishlist.ts` is a **HYBRID module** — it is imported by BOTH:

- **Client code**: `EnhancedWishlistContext.tsx`, `WishlistContext.tsx`
  → these use the RTDB / client Firestore SDK (real-time listeners, `getRawWishlistItems`, `subscribeToWishlist`)
- **Server code**: API routes under `src/app/api/**`
  → these use the Firebase **Admin SDK** (bypasses security rules)

To keep `firebase-admin` (Node-only) out of the client bundle, the original author wrapped the admin import in `eval()`:

```ts
return await eval("import('@/lib/database/firestore-wishlist-admin')");
```

The `eval()` hid the import from webpack's static analysis so `firebase-admin` was never compiled into the client bundle. **But it also broke the server.**

---

## Root Cause

Two coupled problems:

### 1. `@/` path aliases can't be resolved at runtime
`eval()` bypasses webpack entirely. At runtime Node.js sees the literal string `@/lib/database/firestore-wishlist-admin` and tries to resolve `@/lib` as an npm package → `Cannot find package '@/lib'`. TypeScript path aliases only exist during webpack compilation; Node never knows about them.

### 2. `eval()` prevents the module from being emitted
Because webpack never saw the import, it never compiled `firestore-wishlist-admin.ts` or emitted it as a chunk in `.next/server/`. Even if the path had been relative, there was no compiled file to load.

### 3. The inverse problem once you stop using `eval()`
Replacing `eval()` with a plain `import('./firestore-wishlist-admin')` fixes the **server** (webpack now compiles + emits the chunk and resolves `@/` paths). But now webpack *can* follow the chain into `firebase-admin` for the **client** bundle, since the hybrid module is imported by client contexts. That crashes the browser build:
```
Can't resolve 'http2'
UnhandledSchemeError: node:events / node:process / node:stream / node:util
```
Because `firebase-admin` uses `http2` and `node:`-prefixed builtins that don't exist in browsers.

---

## The Fix (Two Parts)

### Part A — `src/lib/database/firestore-wishlist.ts`
Use a regular dynamic `import()` with a **relative** path so webpack compiles/emits the chunk and Node can resolve it at runtime:

```ts
// BEFORE (broken on server)
async function getAdminModule() {
  return await eval("import('@/lib/database/firestore-wishlist-admin')");
}

// AFTER
async function getAdminModule() {
  return await import('./firestore-wishlist-admin');
}
```

### Part B — `next.config.ts`
Mark `firebase-admin` as **external for client builds** so webpack never parses its Node-only internals for the browser. The existing `serverExternalPackages: ['firebase-admin']` only affects the *server* build; the client build still tried to compile `firebase-admin`'s source (hence the `http2` / `node:*` errors).

```ts
webpack: (config, { dev, isServer }) => {
  if (!isServer) {
    // Mark firebase-admin external for client builds.
    // webpack emits require('firebase-admin') without parsing its source,
    // so http2 + node:* builtins never reach the browser bundle.
    // The admin code path only runs on the server (resolves from node_modules).
    config.externals = config.externals || [];
    if (!Array.isArray(config.externals)) config.externals = [config.externals];
    if (!config.externals.includes('firebase-admin')) config.externals.push('firebase-admin');

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, net: false, tls: false, http2: false, crypto: false,
      http: false, https: false, stream: false, buffer: false, util: false,
      url: false, zlib: false, path: false, os: false, child_process: false,
    };
  }
  // ...
}

// (existing, server-side) keep as-is:
serverExternalPackages: ['firebase-admin'],
```

### Why both parts are needed
- Without Part A: server fails with `Cannot find package '@/lib'` (admin module never compiled, path alias unresolved).
- Without Part B: client fails with `Can't resolve 'http2'` / `node:*` UnhandledSchemeError (firebase-admin internals compiled into browser bundle).

### Why this is safe on the client
The client contexts (`EnhancedWishlistContext`, `WishlistContext`) only call client-safe exports (`getRawWishlistItems`, `subscribeToWishlist` from the RTDB/client SDK). The admin code path (`phase === 'firestore'` → `getAdminModule()`) only runs **server-side** in the API routes, where `firebase-admin` resolves normally from `node_modules`. On the client, `getAdminModule` is simply never invoked, and webpack never parses `firebase-admin`'s source.

---

## Files Changed
1. `src/lib/database/firestore-wishlist.ts` — `eval("import('@/...')")` → `import('./...')`
2. `next.config.ts` — add `firebase-admin` to client `config.externals` + `http2: false` fallback

## To Apply
1. **Stop the dev server** (Ctrl+C). next.config changes need a full restart.
2. Delete the stale build cache: `Remove-Item -Recurse -Force .next`
3. `npm run dev`
4. Test: open a franchise → click "Add to Wishlist" → expect `200 OK` + `[Wishlist API] ✅ add_to_wishlist successful` in the server terminal.

If the original 500 returns with a *different* error after these changes, that's progress — share the new server stack trace and it can be addressed directly.