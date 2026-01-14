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
app.use("*", cors());

// ヘルスチェック
app.get("/", (c) => c.json({ status: "ok", service: "nostalgic-api" }));

// API Routes
app.route("/visit", visitRoute);
app.route("/like", likeRoute);
app.route("/ranking", rankingRoute);
app.route("/bbs", bbsRoute);
app.route("/yokoso", yokosoRoute);

export default app;
