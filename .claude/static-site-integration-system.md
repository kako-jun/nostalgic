# 静的サイト統合システム計画

## 概要

静的サイト（GitHub Pages、note、はてなブログ等）で利用可能なNostalgic全4サービス（Counter/Like/Ranking/BBS）の画像ベース統合システム。HTMLの基本機能（`<img>` + `<a>` + `<map>`）だけで、JavaScript不要の完全なWebツール機能を実現。

## 現状の問題点

### 静的サイトでの利用困難

```html
<!-- 現在：2回のリクエストが必要 -->
<img src="/api/visit?action=display&id=xxx" />
<!-- 表示のみ -->
<script>
  fetch("/api/visit?action=increment&id=xxx");
</script>
<!-- カウントアップ -->

<!-- 問題：静的サイトではJSが使えない場合が多い -->
```

### API設計の複雑さ

- `action=display`：表示専用
- `action=increment`：カウントアップ専用
- 用途が分離されて使いにくい

## 解決案：画像表示 = カウントアップ

### 基本仕様

```html
<!-- 静的サイトでこれだけでOK -->
<img
  src="https://nostalgic.llll-ll.com/api/visit?action=display&id=your-id&type=total&theme=light"
  alt="Visit Counter"
/>
```

### API動作

1. **画像リクエスト受信**
2. **カウントアップ実行**（重複防止ロジック適用）
3. **SVG画像を返す**（Content-Type: image/svg+xml）

### 重複防止の活用

```javascript
// 同じユーザーが同じページに複数画像を設置しても
const hash = generateHash(ip, userAgent, date);
// 1日1回のみカウントアップ
if (!(await redis.exists(`visit:counter:${id}:${hash}`))) {
  await incrementCounter(id);
}
```

## 活用場面

### Counter（カウンター）

#### GitHub README.md

```markdown
# MyProject

![Visit Counter](https://nostalgic.llll-ll.com/api/visit?action=display&id=myproject-abc123&type=total&theme=dark)

## Stats

- Total Visits: ![Total](https://nostalgic.llll-ll.com/api/visit?action=display&id=myproject-abc123&type=total&theme=light)
- This Month: ![Month](https://nostalgic.llll-ll.com/api/visit?action=display&id=myproject-abc123&type=month&theme=kawaii)
```

#### 静的ブログ

```html
<!-- Hugo, Jekyll, 11ty等 -->
<footer>
  Page views:
  <img src="https://nostalgic.llll-ll.com/api/visit?action=display&id=blog-xyz789&type=total" />
</footer>
```

#### ポートフォリオサイト

```html
<!-- Netlify, GitHub Pages等 -->
<div class="stats">
  <img
    src="https://nostalgic.llll-ll.com/api/visit?action=display&id=portfolio-def456&theme=ff"
    alt="Visitor Count"
  />
</div>
```

#### 各種プラットフォームでの埋め込み

```markdown
<!-- はてなブログ、note、Qiita等 -->

![この記事の閲覧数](https://nostalgic.llll-ll.com/api/visit?action=display&id=myarticle-ghi789&type=total&theme=light)

この記事は上記の回数読まれました！
```

**革新的な価値:**

- **勝手に統計取得**: 記事/ページの実際の閲覧数を測定
- **プラットフォーム非依存**: サービス側の分析機能に頼らない独自統計
- **リアルタイム表示**: 画像が表示されるたびに自動カウント

### Like（いいね）

#### 表示専用（いいね数の確認）

```html
<!-- 現在のいいね数を画像で表示 -->
<img
  src="https://nostalgic.llll-ll.com/api/like?action=display&id=nostalgic-abc123&theme=kawaii"
  alt="👍 Likes"
/>
```

#### インタラクティブ（クリック可能ないいねボタン）

```html
<!-- 静的サイトでクリック可能なLikeボタン -->
<a
  href="https://nostalgic.llll-ll.com/api/like?action=toggle&id=nostalgic-abc123&redirect=true"
  target="_blank"
>
  <img
    src="https://nostalgic.llll-ll.com/api/like?action=display&id=nostalgic-abc123&theme=kawaii"
    alt="👍 Like this!"
  />
</a>
```

**動作フロー:**

1. **画像表示**: 現在のいいね数が画像で表示
2. **クリック**: 別タブでLike APIが実行される（パブリックIDなのでトークン不要）
3. **完了ページ**: 「いいね完了！元のページをリロードしてください」
4. **確認**: 元のページを更新すると数値が増えている

#### Like API完了ページ

```html
<!-- /api/like?action=toggle&redirect=true のレスポンス -->
<html>
  <head>
    <title>いいね完了！</title>
  </head>
  <body style="text-align: center; padding: 50px; font-family: Arial;">
    <h1 style="color: #4CAF50;">👍 いいね完了！</h1>
    <p>ありがとうございます！</p>
    <p><strong>元のページをリロードすると、いいねが増えているはずです。</strong></p>
    <p><small>このタブは閉じて構いません。</small></p>
  </body>
</html>
```

**静的サイトでのLikeボタンの価値:**

- **JavaScript不要**: `<a>` + `<img>` タグだけで完全動作
- **パブリックID**: 誰でも気軽にいいね可能
- **直感的操作**: 1990年代のWebリンクと同じ操作感
- **あらゆる場所で利用可能**: ブログ、note、SNS等で埋め込み可能

## 技術実装

### API修正内容

#### Counter API

```typescript
// /api/visit/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "display") {
    // 1. カウントアップ実行
    await handleIncrement(id, request);

    // 2. SVG生成・返却
    const svg = await generateCounterSVG(id, type, theme);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }
}
```

#### Ranking API - 統一SVG生成アプローチ（第一候補）

```typescript
// /api/ranking/route.ts（既存パターンを踏襲）
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const id = searchParams.get("id");
  const theme = searchParams.get("theme");

  if (action === "display") {
    // 1. ランキングデータ取得
    const rankingData = await getRankingData(id);

    // 2. 既存のgenerateCounterSVGと同じパターンでSVG生成
    const svg = generateRankingSVG({
      data: rankingData,
      theme: theme || "dark",
    });

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60",
      },
    });
  }
}
```

#### Ranking SVG生成関数（既存パターンと統一）

```typescript
// /src/lib/image-generator.ts に追加
export function generateRankingSVG(options: RankingImageOptions): string {
  const { data, theme = "dark" } = options;

  // 既存のカウンター用テーマ設定を活用
  const styles = {
    light: {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      headerColor: "#333333",
      border: "#000000",
    },
    dark: {
      backgroundColor: "#1a1a1a",
      textColor: "#ffffff",
      headerColor: "#ffffff",
      border: "#ffffff",
    },
    kawaii: {
      backgroundColor: "#e0f7fa",
      textColor: "#e91e63",
      headerColor: "#9c27b0",
      border: "#9c27b0",
    },
  };

  const currentStyle = styles[theme];
  const width = 280;
  const height = Math.max(120, 20 + data.length * 18);

  // 上位5件のみ表示
  const topEntries = data.slice(0, 5);

  let svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- 背景 -->
      <rect width="${width}" height="${height}" fill="${currentStyle.backgroundColor}" stroke="${currentStyle.border}" stroke-width="1"/>
      
      <!-- ヘッダー -->
      <text x="140" y="25" fill="${currentStyle.headerColor}" font-family="Arial" font-size="16" text-anchor="middle" font-weight="bold">🏆 Ranking</text>
  `;

  // ランキング項目を追加
  topEntries.forEach((entry, index) => {
    const y = 50 + index * 18;
    svgContent += `
      <text x="20" y="${y}" fill="${currentStyle.textColor}" font-family="Arial" font-size="13">
        ${index + 1}位 ${entry.name} - ${entry.displayScore || entry.score}
      </text>
    `;
  });

  svgContent += "</svg>";
  return svgContent.trim();
}
```

### キャッシュ戦略

```typescript
// カウント値は適度にキャッシュ
'Cache-Control': 'public, max-age=60'  // 1分間キャッシュ

// ただしカウントアップは確実に実行
// Redis側で重複防止を制御
```

## 既存機能への影響

### 他サービスへの応用可能性

#### Ranking（ランキング）- リードオンリー

```html
<!-- 静的サイトでのランキング表示（読み取り専用） -->
<img
  src="https://nostalgic.llll-ll.com/api/ranking?action=display&id=game-abc123&theme=ff"
  alt="Game Ranking"
/>
```

**用途:**

- 外部ゲームサイトでのハイスコア表示
- GitHub READMEでの統計ランキング
- 静的ブログでのイベント結果表示

#### BBS（掲示板）- 完全機能対応

```html
<!-- 静的サイトでの完全BBS機能 -->
<a href="https://nostalgic.llll-ll.com/bbs/ui?id=guestbook-xyz789" target="_blank">
  <img
    src="https://nostalgic.llll-ll.com/api/bbs?action=display&id=guestbook-xyz789&theme=kawaii"
    alt="BBS"
    usemap="#bbs-guestbook-xyz789"
  />
</a>

<!-- クリックマップ：各ボタンを正確な座標でマッピング -->
<map name="bbs-guestbook-xyz789">
  <!-- 新規投稿ボタン -->
  <area
    shape="rect"
    coords="10,10,80,30"
    href="https://nostalgic.llll-ll.com/bbs/ui?id=guestbook-xyz789&action=post"
    alt="新規投稿"
  />

  <!-- メッセージ1の操作ボタン -->
  <area
    shape="rect"
    coords="200,50,230,70"
    href="https://nostalgic.llll-ll.com/bbs/ui?id=guestbook-xyz789&action=edit&messageId=msg001"
    alt="編集"
  />
  <area
    shape="rect"
    coords="235,50,265,70"
    href="https://nostalgic.llll-ll.com/bbs/ui?id=guestbook-xyz789&action=delete&messageId=msg001"
    alt="削除"
  />

  <!-- メッセージ2の操作ボタン -->
  <area
    shape="rect"
    coords="200,90,230,110"
    href="https://nostalgic.llll-ll.com/bbs/ui?id=guestbook-xyz789&action=edit&messageId=msg002"
    alt="編集"
  />
  <!-- さらに他のメッセージ分も続く... -->
</map>
```

**BBS統一UI実装:**

```typescript
// /app/bbs/ui/page.tsx - 全てのBBSに統一のUIを提供
export default function BBSUIPage({ searchParams }) {
  const { id, action, messageId } = searchParams

  if (action === 'post') {
    return <NewPostForm bbsId={id} />
  } else if (action === 'edit') {
    return <EditPostForm bbsId={id} messageId={messageId} />
  } else if (action === 'delete') {
    return <DeleteConfirmForm bbsId={id} messageId={messageId} />
  }

  return <BBSMainUI bbsId={id} />
}

// 新規投稿フォーム
function NewPostForm({ bbsId }) {
  return (
    <form action="/api/bbs" method="GET">
      <input type="hidden" name="action" value="post" />
      <input type="hidden" name="id" value={bbsId} />
      <input type="hidden" name="redirect" value="success" />

      <input name="author" placeholder="名前" required />
      <textarea name="message" placeholder="メッセージ" required></textarea>
      <button type="submit">投稿</button>
    </form>
  )
}
```

**動的クリックマップ生成:**

```typescript
// /api/bbs に追加機能
export async function GET(request: Request) {
  const action = searchParams.get("action");

  if (action === "display") {
    // SVG生成
    const svg = generateBBSSVG(messages, theme);

    // 同時にクリックマップも生成
    const clickMap = generateBBSClickMap(messages, bbsId);

    // 特別なレスポンスでSVGとマップの座標を返す
    return new Response(
      JSON.stringify({
        svg: svg,
        clickMap: clickMap,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

function generateBBSClickMap(messages: Message[], bbsId: string): ClickMapArea[] {
  const areas: ClickMapArea[] = [];

  // 新規投稿ボタン
  areas.push({
    shape: "rect",
    coords: "10,10,80,30",
    href: `https://nostalgic.llll-ll.com/bbs/ui?id=${bbsId}&action=post`,
    alt: "新規投稿",
  });

  // 各メッセージの編集・削除ボタン
  messages.forEach((message, index) => {
    const y = 50 + index * 40; // メッセージ間隔に合わせて計算

    areas.push({
      shape: "rect",
      coords: `200,${y},230,${y + 20}`,
      href: `https://nostalgic.llll-ll.com/bbs/ui?id=${bbsId}&action=edit&messageId=${message.id}`,
      alt: "編集",
    });

    areas.push({
      shape: "rect",
      coords: `235,${y},265,${y + 20}`,
      href: `https://nostalgic.llll-ll.com/bbs/ui?id=${bbsId}&action=delete&messageId=${message.id}`,
      alt: "削除",
    });
  });

  return areas;
}
```

**革新的な価値:**

- **静的サイトで完全BBS**: JavaScript不要でフル機能
- **統一UI**: どのサイトからでも同じ操作感
- **クリックマップ活用**: 画像内の正確なボタン操作
- **1990年代Web技術**: `<map>` + `<area>` で現代機能を実現

### Web Components

```javascript
// Web Componentsは引き続き価値を提供
class NostalgicCounter extends HTMLElement {
  // 1. リアルタイム更新
  setInterval(() => this.loadCounterData(), 30000)

  // 2. インタラクティブ機能
  toggleType() {
    this.type = this.type === 'total' ? 'today' : 'total'
  }

  // 3. エラーハンドリング
  handleError() {
    this.innerHTML = '<span>Loading error</span>'
  }
}
```

### 用途の棲み分け

- **静的サイト・README・ブログサービス**: `<img>` + `<a>` タグ（シンプル・確実・どこでも動作）
- **動的サイト・本格的なWebアプリ**: Web Components（リアルタイム・高機能・UX重視）

## action=increment の今後

### 保留する理由

1. **特殊ケース対応**
   - AJAX での非同期処理
   - 外部システム連携
   - バッチ処理

2. **後方互換性**
   - 既存利用者への配慮
   - 段階的な移行

### 判断基準

- 実際の利用状況を監視
- 使われなければ将来的に廃止
- メンテナンスコストとのバランス

## バッジデザイン拡張

### Shields.io 風スタイル

```svg
<!-- 現在のSVG -->
<rect fill="#333" />
<text>1234</text>

<!-- Shields.io風 -->
<rect fill="#555" />  <!-- 左側：ラベル部分 -->
<text>visits</text>
<rect fill="#4c1" />  <!-- 右側：数値部分 -->
<text>1234</text>
```

### テーマ別バッジ

- **light**: シンプルなカウンター表示
- **dark**: ダーク背景対応
- **kawaii**: 可愛い水玉デザイン
- **mother2**: レトロゲーム風
- **ff**: RPG風デザイン
- **fancy**: 装飾的なデザイン

## 実装フェーズ

### Phase 1: 基本機能実装

- [ ] API修正（display = カウントアップ + 画像）
- [ ] Content-Type設定
- [ ] 重複防止ロジック確認

### Phase 2: テスト・検証

- [ ] 静的サイトでの動作確認
- [ ] GitHub README.mdでのテスト
- [ ] 複数画像設置時の動作確認

### Phase 3: ドキュメント整備

- [ ] 使用方法ドキュメント作成
- [ ] サンプルコード準備
- [ ] ホームページでのサンプル表示

### Phase 4: バッジデザイン拡張

- [ ] Shields.io風デザイン
- [ ] テーマ別バッジスタイル
- [ ] カスタマイズオプション

## メリット・インパクト

### ユーザー体験

- **簡単設置**: `<img>` タグ1行だけでカウンター、`<a>` + `<img>` でインタラクティブ機能
- **確実動作**: JavaScript不要、HTML標準機能のみ
- **幅広い対応**: あらゆる静的サイト・ブログサービス・SNSで利用可能
- **直感的操作**: 1990年代のWeb操作感と現代機能の融合

### 差別化要素

- **GitHub統計**: README.mdでの訪問者数・いいね数表示
- **プラットフォーム横断**: note、はてなブログ、Qiita等での統計取得
- **レトロ感**: 1990年代風のWebツールを現代技術で完全復活
- **テーマ豊富**: 6テーマで多様なデザインに対応
- **完全静的サイト対応**: 他にない独自性

### 技術的価値

- **革新的API設計**: 画像表示とデータ更新を統合
- **1990年代Web文化の再現**: `<img>` + `<a>` タグだけで現代的機能を実現
- **プラットフォーム非依存**: 独自の統計システムを任意の場所に埋め込み可能
- **パフォーマンス**: 1リクエストで完結、CDN活用可能

## 注意事項・制限

### パフォーマンス

- 画像読み込みごとにRedis書き込み発生
- 適切なキャッシュ戦略が必要
- CDN活用を検討

### セキュリティ

- リクエスト頻度制限
- 不正利用対策
- CORS設定

### 運用面

- ログ監視強化
- エラー率監視
- 負荷テスト実施

---

_この静的サイト統合システムにより、Nostalgicは静的サイトでも利用可能な本格的なWebツールプラットフォームとなる。1990年代のWeb技術（カウンター・BBS・いいね・ランキング）を現代の技術で完全再現し、あらゆる静的サイトに埋め込み可能。_
