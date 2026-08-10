import { Hono } from "hono";
import bbsRoute from "./routes/bbs.ts";
import type { Context, Next } from "hono";

type Bindings = {
  DB: D1Database;
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

// Simple in-memory rate limiter (per-isolate).
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // requests per window per IP

app.use("/guestbook/api/bbs", rateLimiter);
app.use("/guestbook/api/bbs/*", rateLimiter);

async function rateLimiter(c: Context, next: Next) {
  const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) {
      return c.json({ error: "Rate limit exceeded. Please try again later." }, 429);
    }
  }

  // Periodic cleanup (every ~100 requests, evict expired entries)
  if (Math.random() < 0.01) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }

  await next();
}

app.get("/guestbook/api", (c) => c.json({ status: "ok", service: "benjiisworld-guestbook" }));
app.route("/guestbook/api/bbs", bbsRoute);

async function serveGuestbookAsset(c: Context<{ Bindings: Bindings }>) {
  const url = new URL(c.req.url);
  url.pathname = url.pathname.replace(/^\/guestbook(?:\/|$)/, "/");
  return c.env.ASSETS.fetch(new Request(url, c.req.raw));
}

app.get("/guestbook", serveGuestbookAsset);
app.get("/guestbook/*", serveGuestbookAsset);

app.onError((err, c) => {
  console.error(
    "[guestbook] unhandled error:",
    c.req.method,
    c.req.path,
    c.req.query("action"),
    err
  );
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
