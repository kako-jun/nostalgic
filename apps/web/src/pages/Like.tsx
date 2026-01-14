import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import NostalgicLayout from "../components/NostalgicLayout";
import LikeFeaturesTab from "../components/like/LikeFeaturesTab";
import StepRenderer from "../components/StepRenderer";
import { PageFooter } from "../components/common";
import { callApi, callApiWithFormat } from "../utils/apiHelpers";
import { likeSteps } from "../config/services/likeSteps";
import { likeEmbedConfig } from "../config/embedConfigs";

export default function LikePage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const embedId = searchParams.get("id");
  const currentPage = embedId
    ? "embed"
    : location.pathname === "/like/usage"
      ? "usage"
      : "features";

  // Field state
  const [publicId, setPublicId] = useState("");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [format, setFormat] = useState("json");

  // Response state
  const [createResponse, setCreateResponse] = useState("");
  const [displayResponse, setDisplayResponse] = useState("");
  const [toggleResponse, setToggleResponse] = useState("");
  const [getResponse, setGetResponse] = useState("");
  const [deleteResponse, setDeleteResponse] = useState("");
  const [updateSettingsResponse, setUpdateSettingsResponse] = useState("");
  const [batchGetResponse, setBatchGetResponse] = useState("");

  // batchGet state
  const [batchIds, setBatchIds] = useState("");

  const [responseType, setResponseType] = useState<"json" | "text" | "svg">("json");

  // Language demo state
  const [demoLang, setDemoLang] = useState<"" | "ja" | "en">("");

  // Field values for StepRenderer
  const fieldValues = {
    url: { value: url, onChange: setUrl },
    token: { value: token, onChange: setToken },
    publicId: { value: publicId, onChange: setPublicId },
    webhookUrl: { value: webhookUrl, onChange: setWebhookUrl },
    format: { value: format, onChange: setFormat },
  };

  // Handlers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    let apiUrl = `/api/like?action=create&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    await callApi(apiUrl, setCreateResponse, setPublicId);
  };

  const handleDisplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/like?action=get&id=${encodeURIComponent(publicId)}&format=${format}`;
    await callApiWithFormat(
      apiUrl,
      format as "json" | "text" | "image",
      setDisplayResponse,
      setResponseType
    );
  };

  const handleToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/like?action=toggle&id=${encodeURIComponent(publicId)}`;
    await callApi(apiUrl, setToggleResponse);
  };

  const handleGet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/like?action=get&id=${encodeURIComponent(publicId)}`;
    await callApi(apiUrl, setGetResponse);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    const apiUrl = `/api/like?action=delete&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    await callApi(apiUrl, setDeleteResponse);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    let apiUrl = `/api/like?action=update&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    await callApi(apiUrl, setUpdateSettingsResponse);
  };

  const handleBatchGet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchIds.trim()) return;

    const ids = batchIds
      .split(/[,\n]/)
      .map((id) => id.trim())
      .filter((id) => id);

    if (ids.length === 0) return;

    try {
      const response = await fetch("/api/like?action=batchGet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await response.json();
      setBatchGetResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setBatchGetResponse(JSON.stringify({ error: String(error) }, null, 2));
    }
  };

  const handlers = {
    handleCreate,
    handleDisplay,
    handleToggle,
    handleGet,
    handleDelete,
    handleUpdateSettings,
  };

  const responses = {
    createResponse,
    displayResponse,
    toggleResponse,
    getResponse,
    deleteResponse,
    updateSettingsResponse,
  };

  const responseTypes = {
    displayResponse: responseType,
  };

  const renderEmbedCode = () => {
    const attrs = likeEmbedConfig.attributes
      .map((attr) => `${attr.name}="${attr.defaultValue}"`)
      .join(" ");
    return `<script src="${likeEmbedConfig.scriptUrl}"></script>
<${likeEmbedConfig.componentName} id="公開ID" ${attrs}></${likeEmbedConfig.componentName}>`;
  };

  const renderEmbedCodeWithId = () => {
    const attrs = likeEmbedConfig.attributes
      .map((attr) => `${attr.name}="${attr.defaultValue}"`)
      .join(" ");
    return `<script src="${likeEmbedConfig.scriptUrl}"></script>
<${likeEmbedConfig.componentName} id="${publicId}" ${attrs}></${likeEmbedConfig.componentName}>`;
  };

  const renderUsagePage = () => (
    <>
      <div className="nostalgic-title-bar">
        ★ Nostalgic Like ★
        <br />
        使い方
      </div>

      <StepRenderer
        steps={likeSteps}
        fieldValues={fieldValues}
        handlers={handlers}
        responses={responses}
        responseTypes={responseTypes}
        serviceName="いいね"
      />

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆一括取得（batchGet）◆</b>
          </span>
        </p>
        <p
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            padding: "8px 12px",
            borderRadius: "4px",
            marginBottom: "10px",
          }}
        >
          ⚠️ <b>POSTメソッド必須</b> -
          これは唯一POSTを使用するアクションです。一覧ページで大量のいいね数を1回のリクエストで取得できます。
        </p>
        <form onSubmit={handleBatchGet}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              公開IDリスト（カンマまたは改行で区切り）:
            </label>
            <textarea
              value={batchIds}
              onChange={(e) => setBatchIds(e.target.value)}
              placeholder={"id-1, id-2, id-3\nまたは\nid-1\nid-2\nid-3"}
              style={{
                width: "100%",
                height: "80px",
                padding: "8px",
                fontFamily: "monospace",
                fontSize: "14px",
                border: "1px solid #666",
                resize: "vertical",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#2196F3",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              一括取得（POST）
            </button>
          </div>
        </form>
        <div style={{ marginBottom: "10px" }}>
          <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>API URL:</p>
          <code
            style={{
              display: "block",
              backgroundColor: "#f0f0f0",
              padding: "8px",
              fontSize: "12px",
              wordBreak: "break-all",
            }}
          >
            POST /api/like?action=batchGet
            <br />
            Body: {"{"} &quot;ids&quot;: [&quot;id-1&quot;, &quot;id-2&quot;, ...] {"}"}
          </code>
        </div>
        {batchGetResponse && (
          <pre
            style={{
              backgroundColor: "#1e1e1e",
              color: "#d4d4d4",
              padding: "10px",
              overflow: "auto",
              fontSize: "12px",
              maxHeight: "200px",
            }}
          >
            {batchGetResponse}
          </pre>
        )}
      </div>

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆STEP 3: いいね埋め込み◆</b>
          </span>
        </p>
        <p>あなたのサイトのHTMLに以下のコードを追加してください。</p>
        <pre
          style={{
            backgroundColor: "#f0f0f0",
            padding: "10px",
            overflow: "auto",
            fontSize: "14px",
            margin: "10px 0",
          }}
        >
          {renderEmbedCode()
            .split("\n")
            .map((line, i) => (
              <span key={i}>
                {line}
                {i < 1 && <br />}
              </span>
            ))}
        </pre>

        {likeEmbedConfig.sections.map((section, idx) => (
          <div className="nostalgic-section" key={idx}>
            <p>
              <span className="nostalgic-section-title">
                <b>◆{section.title}◆</b>
              </span>
            </p>
            <p>
              {section.options.map((opt, optIdx) => (
                <span key={optIdx}>
                  • <span style={{ color: "#008000" }}>{opt.value}</span> - {opt.description}
                  {optIdx < section.options.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        ))}

        <div className="nostalgic-section">
          <p>
            <span className="nostalgic-section-title">
              <b>◆TypeScript使用時の設定◆</b>
            </span>
          </p>
          <p>
            TypeScriptプロジェクトでWeb Componentsを使用する場合、プロジェクトルートに{" "}
            <code>types.d.ts</code> ファイルを作成してください。
          </p>
          <pre
            style={{
              backgroundColor: "#f0f0f0",
              padding: "10px",
              overflow: "auto",
              fontSize: "12px",
              margin: "10px 0",
            }}
          >
            {likeEmbedConfig.typescriptType}
          </pre>
          <p style={{ fontSize: "14px", color: "#666" }}>
            ※この設定により、TypeScriptでWeb Componentsを使用してもビルドエラーが発生しません。
          </p>
        </div>

        <div className="nostalgic-section">
          <p>
            <span className="nostalgic-section-title">
              <b>◆言語切り替えテスト◆</b>
            </span>
          </p>
          <p style={{ marginBottom: "10px" }}>
            以下のコンポーネントの表示言語を切り替えます（エラーメッセージ等に反映されます）
          </p>
          <div style={{ marginBottom: "15px" }}>
            <select
              value={demoLang}
              onChange={(e) => setDemoLang(e.target.value as "" | "ja" | "en")}
              style={{
                padding: "5px 10px",
                fontSize: "14px",
                border: "1px solid #666",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="">指定なし（ブラウザ言語）</option>
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>
          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>Light</p>
              <nostalgic-like
                id="nostalgic-b89803bb"
                theme="light"
                icon="heart"
                lang={demoLang || undefined}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>Dark</p>
              <nostalgic-like
                id="nostalgic-b89803bb"
                theme="dark"
                icon="heart"
                lang={demoLang || undefined}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>Retro</p>
              <nostalgic-like
                id="nostalgic-b89803bb"
                theme="retro"
                icon="heart"
                lang={demoLang || undefined}
              />
            </div>
          </div>
        </div>
      </div>

      {publicId && (
        <div className="nostalgic-section">
          <p>
            <span style={{ color: "#ff8c00" }}>
              <b>◆いいね設置方法◆</b>
            </span>
          </p>
          <p>
            公開ID:{" "}
            <span
              style={{
                backgroundColor: "#ffff00",
                padding: "2px 4px",
                fontFamily: "monospace",
              }}
            >
              {publicId}
            </span>
          </p>
          <p
            style={{
              backgroundColor: "#f0f0f0",
              padding: "10px",
              fontFamily: "monospace",
              fontSize: "14px",
              wordBreak: "break-all",
            }}
          >
            {renderEmbedCodeWithId()}
          </p>
        </div>
      )}

      <PageFooter servicePath="like" currentPage="usage" />
    </>
  );

  const renderFeaturesPage = () => (
    <>
      <LikeFeaturesTab />
      <PageFooter servicePath="like" currentPage="features" />
    </>
  );

  const renderEmbedPage = () => (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <p style={{ margin: 0, textAlign: "center", color: "#333" }}>
        このプロジェクトにいいねを押してください！
        <br />
        <span style={{ fontSize: "12px", color: "#666" }}>
          ※GitHubアカウント不要で誰でも押せます
        </span>
      </p>
      <nostalgic-like id={embedId!} theme="light" icon="heart" />
      <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>
        Powered by{" "}
        <a
          href="https://nostalgic.llll-ll.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#666" }}
        >
          Nostalgic
        </a>
      </p>
    </div>
  );

  if (currentPage === "embed") {
    return renderEmbedPage();
  }

  return (
    <NostalgicLayout serviceName="Like" serviceIcon="💖">
      {currentPage === "usage" ? renderUsagePage() : renderFeaturesPage()}
    </NostalgicLayout>
  );
}
