import { useState } from "react";
import { useLocation } from "react-router-dom";
import NostalgicLayout from "../components/NostalgicLayout";
import LikeFeaturesTab from "../components/like/LikeFeaturesTab";
import StepRenderer from "../components/StepRenderer";
import { PageFooter } from "../components/common";
import { callApi, callApiWithFormat } from "../utils/apiHelpers";
import { likeSteps } from "../config/services/likeSteps";
import { likeEmbedConfig } from "../config/embedConfigs";

export default function LikePage() {
  const location = useLocation();
  const currentPage = location.pathname === "/like/usage" ? "usage" : "features";

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

  return (
    <NostalgicLayout serviceName="Like" serviceIcon="💖">
      {currentPage === "usage" ? renderUsagePage() : renderFeaturesPage()}
    </NostalgicLayout>
  );
}
