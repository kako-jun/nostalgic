export default function CounterFeaturesTab() {
  return (
    <>
      <div className="nostalgic-title-bar">
        ★ Nostalgic Counter ★
        <br />
        機能一覧
      </div>

      <div className="nostalgic-marquee-box">
        <div className="nostalgic-marquee-text">
          懐かしのアクセスカウンターがここに復活！累計・今日・昨日・週間・月間のカウントを表示できます！
        </div>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆基本機能◆</b>
          </span>
        </p>
        <p>
          <span>●</span> 累計・日別・週別・月別カウント
          <br />
          <span>●</span> 24時間重複カウント防止
          <br />
          <span>●</span> 3種類のデザインテーマ
          <br />
          <span>●</span> Web Componentsで簡単設置
        </p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆管理機能◆</b>
          </span>
        </p>
        <p>
          <span>●</span> バレてはいけない「オーナートークン」で安全管理
          <br />
          <span>●</span> バレてもかまわない「公開ID」で表示専用アクセス
          <br />
          <span>●</span> カウンター値の手動設定（
          <span style={{ textDecoration: "line-through" }}>訪問者数を水増し可能</span>{" "}
          リセットされても再開可能）
        </p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆技術仕様◆</b>
          </span>
        </p>
        <p>
          <span>●</span>Cloudflare Workers でホスティング
          <br />
          <span>●</span>D1 (SQLite) でデータ保存
          <br />
          <span>●</span>SVG画像で美しい表示
          <br />
          <span>●</span>必要なすべての要素が無料プランの範囲で動作するため、完全無料・広告なしを実現
        </p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆GitHubのREADMEに埋め込む◆</b>
          </span>
        </p>
        <p>
          GitHubのREADME.mdにもカウンターを埋め込めます！
          <br />
          <a href="/github" className="nostalgic-old-link">
            → 埋め込み方法はこちら
          </a>
        </p>
      </div>
    </>
  );
}
