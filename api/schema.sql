-- Nostalgic D1 Schema
-- シンプルな設計: 各サービスごとにテーブルを分離

-- サービス共通メタデータ
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,              -- 'example-a1b2c3d4'
  type TEXT NOT NULL,               -- 'counter' | 'like' | 'ranking' | 'bbs'
  url TEXT NOT NULL,
  owner_hash TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  metadata TEXT                     -- JSON for flexible settings
);

-- URL → ID マッピング（高速検索用）
CREATE TABLE IF NOT EXISTS url_mappings (
  type TEXT NOT NULL,               -- 'counter' | 'like' | 'ranking' | 'bbs'
  url TEXT NOT NULL,
  service_id TEXT NOT NULL,
  PRIMARY KEY (type, url)
);

-- オーナートークン（認証用）
CREATE TABLE IF NOT EXISTS owner_tokens (
  service_id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL
);

-- カウンター: 累計カウント
CREATE TABLE IF NOT EXISTS counters (
  service_id TEXT PRIMARY KEY,
  total INTEGER DEFAULT 0
);

-- カウンター: 日別カウント
CREATE TABLE IF NOT EXISTS counter_daily (
  service_id TEXT NOT NULL,
  date TEXT NOT NULL,               -- 'YYYY-MM-DD'
  count INTEGER DEFAULT 0,
  PRIMARY KEY (service_id, date)
);

-- いいね: 累計
CREATE TABLE IF NOT EXISTS likes (
  service_id TEXT PRIMARY KEY,
  total INTEGER DEFAULT 0
);

-- ランキング: スコア
CREATE TABLE IF NOT EXISTS ranking_scores (
  service_id TEXT NOT NULL,
  name TEXT NOT NULL,
  score REAL NOT NULL,
  display_score TEXT,               -- 表示用フォーマット済みスコア
  unique_id TEXT,                   -- 同名区別用
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (service_id, name, unique_id)
);

-- ランキング: スコア取得用インデックス
CREATE INDEX IF NOT EXISTS idx_ranking_scores_order
  ON ranking_scores(service_id, score DESC);

-- BBS: メッセージ
CREATE TABLE IF NOT EXISTS bbs_messages (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  author TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT,
  selects TEXT,                     -- JSON
  user_hash TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- BBS: サービス別メッセージ取得用インデックス
CREATE INDEX IF NOT EXISTS idx_bbs_messages_service
  ON bbs_messages(service_id, created_at DESC);

-- 日次アクション記録（訪問・いいねの重複防止）
-- date + 翌日に古いデータを削除するクリーンアップで管理
CREATE TABLE IF NOT EXISTS daily_actions (
  service_id TEXT NOT NULL,
  user_hash TEXT NOT NULL,
  date TEXT NOT NULL,               -- 'YYYY-MM-DD'
  action_type TEXT NOT NULL,        -- 'visit' | 'like'
  value TEXT,                       -- いいねの場合 'true'/'false'
  PRIMARY KEY (service_id, user_hash, date, action_type)
);

-- 日次アクション: 日付でのクリーンアップ用インデックス
CREATE INDEX IF NOT EXISTS idx_daily_actions_date
  ON daily_actions(date);

-- レート制限（投稿クールダウン等）
CREATE TABLE IF NOT EXISTS rate_limits (
  service_id TEXT NOT NULL,
  user_hash TEXT NOT NULL,
  action_type TEXT NOT NULL,        -- 'post' | 'submit'
  expires_at TEXT NOT NULL,         -- ISO8601
  PRIMARY KEY (service_id, user_hash, action_type)
);

-- レート制限: 期限切れ削除用インデックス
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires
  ON rate_limits(expires_at);
