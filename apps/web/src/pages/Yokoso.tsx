import { useState } from "react";
import { useLocation } from "react-router-dom";
import NostalgicLayout from "../components/NostalgicLayout";
import YokosoFeaturesTab from "../components/yokoso/YokosoFeaturesTab";
import StepRenderer from "../components/StepRenderer";
import { PageFooter } from "../components/common";
import { highlightPublicId } from "../components/ApiUrlDisplay";
import { callApi, callApiWithFormat } from "../utils/apiHelpers";
import { yokosoSteps } from "../config/services/yokosoSteps";
import { yokosoEmbedConfig } from "../config/embedConfigs";

export default function YokosoPage() {
  const location = useLocation();
  const currentPage = location.pathname === "/yokoso/usage" ? "usage" : "features";

  // Field state
  const [publicId, setPublicId] = useState("");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [format, setFormat] = useState("json");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("badge");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  // Response state
  const [createResponse, setCreateResponse] = useState("");
  const [displayResponse, setDisplayResponse] = useState("");
  const [updateResponse, setUpdateResponse] = useState("");
  const [getResponse, setGetResponse] = useState("");
  const [deleteResponse, setDeleteResponse] = useState("");

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
    message: { value: message, onChange: setMessage },
    mode: { value: mode, onChange: setMode },
    name: { value: name, onChange: setName },
    avatar: { value: avatar, onChange: setAvatar },
  };

  // Handlers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token || !message) return;

    let apiUrl = `/api/yokoso?action=create&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}&message=${encodeURIComponent(message)}&mode=${mode}`;
    if (name) apiUrl += `&name=${encodeURIComponent(name)}`;
    if (avatar) apiUrl += `&avatar=${encodeURIComponent(avatar)}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    await callApi(apiUrl, setCreateResponse, setPublicId);
  };

  const handleDisplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/yokoso?action=get&id=${encodeURIComponent(publicId)}&format=${format}`;
    await callApiWithFormat(
      apiUrl,
      format as "json" | "text" | "image",
      setDisplayResponse,
      setResponseType
    );
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    let apiUrl = `/api/yokoso?action=update&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (message) apiUrl += `&message=${encodeURIComponent(message)}`;
    if (mode) apiUrl += `&mode=${mode}`;
    if (name) apiUrl += `&name=${encodeURIComponent(name)}`;
    if (avatar) apiUrl += `&avatar=${encodeURIComponent(avatar)}`;

    await callApi(apiUrl, setUpdateResponse);
  };

  const handleGet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/yokoso?action=get&id=${encodeURIComponent(publicId)}`;
    await callApi(apiUrl, setGetResponse);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    const apiUrl = `/api/yokoso?action=delete&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    await callApi(apiUrl, setDeleteResponse);
  };

  const handlers = {
    handleCreate,
    handleDisplay,
    handleUpdate,
    handleGet,
    handleDelete,
  };

  const responses = {
    createResponse,
    displayResponse,
    updateResponse,
    getResponse,
    deleteResponse,
  };

  const responseTypes = {
    displayResponse: responseType,
  };

  const renderEmbedCode = () => {
    const attrs = yokosoEmbedConfig.attributes
      .map((attr) => `${attr.name}="${attr.defaultValue}"`)
      .join(" ");
    return `<script src="${yokosoEmbedConfig.scriptUrl}"></script>
<${yokosoEmbedConfig.componentName} id="公開ID" ${attrs}></${yokosoEmbedConfig.componentName}>`;
  };

  const renderEmbedCodeWithId = () => {
    const attrs = yokosoEmbedConfig.attributes
      .map((attr) => `${attr.name}="${attr.defaultValue}"`)
      .join(" ");
    return `<script src="${yokosoEmbedConfig.scriptUrl}"></script>
<${yokosoEmbedConfig.componentName} id="${publicId}" ${attrs}></${yokosoEmbedConfig.componentName}>`;
  };

  const renderUsagePage = () => (
    <>
      <div className="nostalgic-title-bar">
        ★ Nostalgic Yokoso ★
        <br />
        使い方
      </div>

      <StepRenderer
        steps={yokosoSteps}
        fieldValues={fieldValues}
        handlers={handlers}
        responses={responses}
        responseTypes={responseTypes}
        serviceName="Yokoso"
      />

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆STEP 3: Yokoso埋め込み◆</b>
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
                {highlightPublicId(line)}
                {i < 1 && <br />}
              </span>
            ))}
        </pre>

        {yokosoEmbedConfig.sections.map((section, idx) => (
          <div className="nostalgic-section" key={idx}>
            <p>
              <span className="nostalgic-section-title">
                <b>◆{section.title}◆</b>
              </span>
            </p>
            <p>
              {section.options.map((opt, optIdx) => (
                <span key={optIdx}>
                  <span>●</span> <span style={{ color: "#008000" }}>{opt.value}</span> -{" "}
                  {opt.description}
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
            {yokosoEmbedConfig.typescriptType}
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
        </div>

        <div className="nostalgic-section">
          <p>
            <span className="nostalgic-section-title">
              <b>◆テーマ - Light◆</b>
            </span>
          </p>
          <div style={{ margin: "20px 0", textAlign: "center" }}>
            <nostalgic-yokoso
              id="nostalgic-demo-yokoso"
              theme="light"
              lang={demoLang || undefined}
            />
          </div>
        </div>

        <div className="nostalgic-section">
          <p>
            <span className="nostalgic-section-title">
              <b>◆テーマ - Dark◆</b>
            </span>
          </p>
          <div style={{ margin: "20px 0", textAlign: "center" }}>
            <div
              style={{
                background: "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                padding: "10px",
                display: "inline-block",
              }}
            >
              <nostalgic-yokoso
                id="nostalgic-demo-yokoso"
                theme="dark"
                lang={demoLang || undefined}
              />
            </div>
          </div>
        </div>

        <div className="nostalgic-section">
          <p>
            <span className="nostalgic-section-title">
              <b>◆テーマ - Retro◆</b>
            </span>
          </p>
          <div style={{ margin: "20px 0", textAlign: "center" }}>
            <div
              style={{
                background: "radial-gradient(ellipse, #666666 60%, rgba(102, 102, 102, 0.3) 100%)",
                padding: "10px",
                display: "inline-block",
              }}
            >
              <nostalgic-yokoso
                id="nostalgic-demo-yokoso"
                theme="retro"
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
              <b>◆Yokoso設置方法◆</b>
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

      <PageFooter servicePath="yokoso" currentPage="usage" />
    </>
  );

  const renderFeaturesPage = () => (
    <>
      <YokosoFeaturesTab />
      <PageFooter servicePath="yokoso" currentPage="features" />
    </>
  );

  return (
    <NostalgicLayout serviceName="Yokoso" serviceIcon="🐱">
      {currentPage === "usage" ? renderUsagePage() : renderFeaturesPage()}
    </NostalgicLayout>
  );
}
