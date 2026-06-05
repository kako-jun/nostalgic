import { Hono } from "hono";
import { cors } from "hono/cors";

import visitRoute from "./routes/visit.ts";
import likeRoute from "./routes/like.ts";
import rankingRoute from "./routes/ranking.ts";
import bbsRoute from "./routes/bbs.ts";
import yokosoRoute from "./routes/yokoso.ts";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS設定
// GET requests: allow any origin (web components are embedded on third-party sites)
// 製品思想として書き込み系アクションも GET で受けるため、mutation も origin "*" で動く。
// POST (JSON body, 管理 Web UI 用): restrict to *.llll-ll.com + localhost（batchGet を除く）
app.use("*", async (c, next) => {
  const method = c.req.method;
  const action = c.req.query("action");
  if (method === "GET" || method === "HEAD" || method === "OPTIONS" || action === "batchGet") {
    return cors({ origin: "*" })(c, next);
  }
  // All *.llll-ll.com subdomains + localhost for development
  return cors({
    origin: (origin) => {
      if (!origin) return "https://nostalgic.llll-ll.com";
      if (origin.endsWith(".llll-ll.com") || origin === "https://llll-ll.com") return origin;
      if (origin.startsWith("http://localhost:")) return origin;
      return null;
    },
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

// 未捕捉エラーの観測性 + レスポンスを JSON に統一（Hono 既定の text/plain をやめる）。
// token 等の機微 query は丸ごと出さず、method / path / action のみログに残す。err 本体は出す。
app.onError((err, c) => {
  console.error(
    "[nostalgic-api] unhandled error:",
    c.req.method,
    c.req.path,
    c.req.query("action"),
    err
  );
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
