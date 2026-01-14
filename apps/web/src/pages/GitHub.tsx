import { useState } from "react";
import NostalgicLayout from "../components/NostalgicLayout";
import { PageFooter } from "../components/common";

export default function GitHubPage() {
  const [counterId] = useState("nostalgic-b89803bb");
  const [likeId] = useState("nostalgic-b89803bb");
  const [bbsId] = useState("nostalgic-1cc54837");

  const counterUrl = `https://api.nostalgic.llll-ll.com/visit?action=increment&id=${counterId}&format=image&theme=github`;
  const likeUrl = `https://api.nostalgic.llll-ll.com/like?action=get&id=${likeId}&format=image`;
  const bbsUrl = `https://api.nostalgic.llll-ll.com/bbs?action=get&id=${bbsId}&format=image&limit=3`;

  const likeLinkUrl = `https://nostalgic.llll-ll.com/like?id=${likeId}`;
  const bbsLinkUrl = `https://nostalgic.llll-ll.com/bbs?id=${bbsId}`;

  return (
    <NostalgicLayout serviceName="GitHub" serviceIcon="📝">
      <div className="nostalgic-title-bar">
        ★ GitHubのREADME埋め込み用 ★
        <br />
        プレビュー
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆README.md での表示イメージ◆</b>
          </span>
        </p>
        <p style={{ marginBottom: "15px" }}>
          GitHubのREADME.mdに以下のコードを貼ると、このように表示されます。
        </p>

        {/* GitHub README風のプレビュー */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #d0d7de",
            borderRadius: "6px",
            padding: "20px 30px",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
            lineHeight: "1.5",
          }}
        >
          <h1
            style={{
              fontSize: "2em",
              fontWeight: "600",
              borderBottom: "1px solid #d0d7de",
              paddingBottom: "0.3em",
              marginTop: 0,
              marginBottom: "16px",
            }}
          >
            My Awesome Project
          </h1>

          <p style={{ marginBottom: "16px" }}>
            <img src={counterUrl} alt="visitors" style={{ verticalAlign: "middle" }} />
          </p>

          <p style={{ marginBottom: "16px" }}>This is my awesome project description.</p>

          <h2
            style={{
              fontSize: "1.5em",
              fontWeight: "600",
              borderBottom: "1px solid #d0d7de",
              paddingBottom: "0.3em",
              marginTop: "24px",
              marginBottom: "16px",
            }}
          >
            Support
          </h2>

          <p style={{ marginBottom: "16px" }}>
            <a href={likeLinkUrl} target="_blank" rel="noopener noreferrer">
              <img src={likeUrl} alt="Like" style={{ verticalAlign: "middle" }} />
            </a>
            <span style={{ marginLeft: "10px", fontSize: "14px", color: "#57606a" }}>
              ← Click to like this project!
            </span>
          </p>

          <h2
            style={{
              fontSize: "1.5em",
              fontWeight: "600",
              borderBottom: "1px solid #d0d7de",
              paddingBottom: "0.3em",
              marginTop: "24px",
              marginBottom: "16px",
            }}
          >
            Discussion
          </h2>

          <p style={{ marginBottom: "16px" }}>
            <a href={bbsLinkUrl} target="_blank" rel="noopener noreferrer">
              <img src={bbsUrl} alt="BBS" style={{ verticalAlign: "middle" }} />
            </a>
          </p>
          <p style={{ fontSize: "14px", color: "#57606a" }}>
            Click the image above to join the discussion!
          </p>
        </div>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆コピペ用コード◆</b>
          </span>
        </p>

        <p style={{ marginTop: "15px", marginBottom: "5px" }}>
          <b>Counter（訪問者数バッジ）:</b>
        </p>
        <pre
          style={{
            backgroundColor: "#f6f8fa",
            padding: "10px",
            overflow: "auto",
            fontSize: "13px",
            border: "1px solid #d0d7de",
            borderRadius: "6px",
          }}
        >
          ![visitors](https://api.nostalgic.llll-ll.com/visit?action=increment&id=
          <span style={{ color: "#008000" }}>公開ID</span>
          &format=image&theme=github)
        </pre>

        <p style={{ marginTop: "15px", marginBottom: "5px" }}>
          <b>Like（いいねボタン）:</b>
        </p>
        <pre
          style={{
            backgroundColor: "#f6f8fa",
            padding: "10px",
            overflow: "auto",
            fontSize: "13px",
            border: "1px solid #d0d7de",
            borderRadius: "6px",
          }}
        >
          [![Like](https://api.nostalgic.llll-ll.com/like?action=get&id=
          <span style={{ color: "#008000" }}>公開ID</span>
          &format=image)](https://nostalgic.llll-ll.com/like?id=
          <span style={{ color: "#008000" }}>公開ID</span>)
        </pre>

        <p style={{ marginTop: "15px", marginBottom: "5px" }}>
          <b>BBS（掲示板）:</b>
        </p>
        <pre
          style={{
            backgroundColor: "#f6f8fa",
            padding: "10px",
            overflow: "auto",
            fontSize: "13px",
            border: "1px solid #d0d7de",
            borderRadius: "6px",
          }}
        >
          [![BBS](https://api.nostalgic.llll-ll.com/bbs?action=get&id=
          <span style={{ color: "#008000" }}>公開ID</span>
          &format=image&limit=3)](https://nostalgic.llll-ll.com/bbs?id=
          <span style={{ color: "#008000" }}>公開ID</span>)
        </pre>

        <p style={{ marginTop: "15px" }}>
          ※ <span style={{ color: "#008000" }}>公開ID</span>{" "}
          の部分を、各サービスで作成したIDに置き換えてください。
        </p>
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆注意事項◆</b>
          </span>
        </p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>
            <b>Counter</b>: README表示時に自動でカウントアップされます
          </li>
          <li>
            <b>Like</b>: 画像クリックでいいねページに移動し、そこでいいねを押せます
            <br />
            <span style={{ color: "#666", marginLeft: "1em" }}>
              ※GitHub Starとは別のいいね機能です（アカウント不要）
            </span>
          </li>
          <li>
            <b>BBS</b>: 画像クリックで掲示板ページに移動し、そこで書き込めます
          </li>
          <li>GitHubは画像をキャッシュするため、更新が反映されるまで時間がかかることがあります</li>
        </ul>
      </div>

      <PageFooter servicePath="github" currentPage="features" />
    </NostalgicLayout>
  );
}
