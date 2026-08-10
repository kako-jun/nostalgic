# Deploying the guestbook

The guestbook is served at `https://benjiisworld.com/guestbook` by one Cloudflare Worker. The Worker also serves the built frontend, so it must be deployed from the repository root through the provided package scripts.

## One-time Cloudflare setup

1. Create the D1 database:

   ```sh
   pnpm --filter @nostalgic/api run db:create
   ```

2. Copy the returned database ID into `wrangler.jsonc` in place of `REPLACE_WITH_YOUR_D1_DATABASE_ID`.

3. Create the tables:

   ```sh
   pnpm --filter @nostalgic/api run db:init
   ```

4. Confirm `benjiisworld.com` is an active zone in the same Cloudflare account. The Worker route is limited to `benjiisworld.com/guestbook*`, so it will not replace the main site.

## Cloudflare build settings

Set these commands in the Cloudflare Git deployment settings:

```text
Build command:  pnpm run build
Deploy command: pnpm run deploy
```

The deploy command must not be `npx wrangler deploy` from the monorepo root; that is the workspace-root error shown in the original build log.

## Local verification and deploy

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm run deploy
```
