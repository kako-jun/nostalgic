import { Hono } from "hono";
import { cors } from "hono/cors";

import visitRoute from "./routes/visit";
import likeRoute from "./routes/like";
import rankingRoute from "./routes/ranking";
import bbsRoute from "./routes/bbs";
import yokosoRoute from "./routes/yokoso";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS設定
// GET requests: allow any origin (web components are embedded on third-party sites)
// Mutation requests (POST/PUT/DELETE): restrict to nostalgic.llll-ll.com only
app.use("*", async (c, next) => {
  const method = c.req.method;
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return cors({ origin: "*" })(c, next);
  }
  return cors({
    origin: ["https://nostalgic.llll-ll.com", "http://localhost:5173", "http://localhost:3000"],
  })(c, next);
});

// --- Simple in-memory rate limiter (per-isolate) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // requests per window per IP

app.use("/visit/*", rateLimiter);
app.use("/like/*", rateLimiter);
app.use("/ranking/*", rateLimiter);
app.use("/bbs/*", rateLimiter);
app.use("/yokoso/*", rateLimiter);
// Also match the route roots (no trailing path)
app.use("/visit", rateLimiter);
app.use("/like", rateLimiter);
app.use("/ranking", rateLimiter);
app.use("/bbs", rateLimiter);
app.use("/yokoso", rateLimiter);

import type { Context, Next } from "hono";
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

// ヘルスチェック
app.get("/", (c) => c.json({ status: "ok", service: "nostalgic-api" }));

// API Routes
app.route("/visit", visitRoute);
app.route("/like", likeRoute);
app.route("/ranking", rankingRoute);
app.route("/bbs", bbsRoute);
app.route("/yokoso", yokosoRoute);

export default app;
