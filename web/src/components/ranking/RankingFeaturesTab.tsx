export default function RankingFeaturesTab() {
  return (
    <>
      <div className="nostalgic-title-bar">
        ★ Nostalgic Ranking ★
        <br />
        機能一覧
      </div>

      <div className="nostalgic-marquee-box">
        <div className="nostalgic-marquee-text">
          🏆 究極のランキングシステム！ゲームスコア・人気投票・何でもランキング化できます！ 🏆
        </div>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆基本機能◆</b>
          </span>
        </p>
        <p>
          <span>●</span> SQLite ORDER BYによる自動ソート
          <br />
          <span>●</span> スコア管理（submit/update/remove/clear）
          <br />
          <span>●</span> 最大エントリー数制限
          <br />
          <span>●</span> Web Componentsで簡単設置
        </p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆利用シーン◆</b>
          </span>
        </p>
        <p>
          <span>●</span> ゲームの高得点ランキング
          <br />
          <span>●</span> 人気投票システム
          <br />
          <span>●</span> クイズの成績表
          <br />
          <span>●</span> コンテストの順位表
        </p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆技術仕様◆</b>
          </span>
        </p>
        <p>
          • Cloudflare Workers でホスティング
          <br />
          • D1 (SQLite) で高速ソート
          <br />
          • 金・銀・銅メダル表示 🥇🥈🥉
          <br />• 必要なすべての要素が無料プランの範囲で動作するため、完全無料・広告なしを実現
        </p>
      </div>
    </>
  );
}
