export default function LikeFeaturesTab() {
  return (
    <>
      <div className="nostalgic-title-bar">
        ★ Nostalgic Like ★
        <br />
        機能一覧
      </div>

      <div className="nostalgic-marquee-box">
        <div className="nostalgic-marquee-text">
          懐かしのいいねボタンがここに復活！ハート・星・サムズアップのアイコンでサイトを盛り上げましょう！
        </div>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆基本機能◆</b>
          </span>
        </p>
        <p>
          <span>●</span> トグル型いいね・いいね取り消し機能
          <br />
          <span>●</span> 24時間ユーザー状態記憶
          <br />
          <span>●</span> 3種類のデザインテーマ
          <br />
          <span>●</span> 3種類のアイコン（ハート・星・サムズアップ）
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
          <span>●</span> いいね数の手動設定（リセットされても再開可能）
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
          <span>●</span>インタラクティブボタンで即座のフィードバック
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
          GitHubのREADME.mdにもいいねボタンを埋め込めます！
          <br />
          <a href="/github" className="nostalgic-old-link">
            → 埋め込み方法はこちら
          </a>
        </p>
      </div>
    </>
  );
}
