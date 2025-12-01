import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS設定
app.use('*', cors())

// ヘルスチェック
app.get('/', (c) => c.json({ status: 'ok', service: 'nostalgic-api' }))

// TODO: 各サービスのルートを追加
// app.route('/api/visit', visitRoute)
// app.route('/api/like', likeRoute)
// app.route('/api/ranking', rankingRoute)
// app.route('/api/bbs', bbsRoute)

export default app
