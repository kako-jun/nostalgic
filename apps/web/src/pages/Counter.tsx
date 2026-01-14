import { useState } from "react";
import { useLocation } from "react-router-dom";
import NostalgicLayout from "../components/NostalgicLayout";
import CounterFeaturesTab from "../components/counter/CounterFeaturesTab";
import StepRenderer from "../components/StepRenderer";
import { PageFooter } from "../components/common";
import { highlightPublicId } from "../components/ApiUrlDisplay";
import { callApi, callApiWithFormat } from "../utils/apiHelpers";
import { counterSteps } from "../config/services/counterSteps";
import { counterEmbedConfig } from "../config/embedConfigs";

export default function CounterPage() {
  const location = useLocation();
  const currentPage = location.pathname === "/counter/usage" ? "usage" : "features";

  // Field state
  const [publicId, setPublicId] = useState("");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [format, setFormat] = useState("json");
  const [setValue, setSetValue] = useState("");

  // Response state
  const [createResponse, setCreateResponse] = useState("");
  const [displayResponse, setDisplayResponse] = useState("");
  const [incrementResponse, setIncrementResponse] = useState("");
  const [getResponse, setGetResponse] = useState("");
  const [setResponse, setSetResponse] = useState("");
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
    setValue: { value: setValue, onChange: setSetValue },
  };

  // Handlers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    let apiUrl = `/api/visit?action=create&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    await callApi(apiUrl, setCreateResponse, setPublicId);
  };

  const handleDisplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/visit?action=get&id=${encodeURIComponent(publicId)}&type=total&format=${format}`;
    await callApiWithFormat(
      apiUrl,
      format as "json" | "text" | "image",
      setDisplayResponse,
      setResponseType
    );
  };

  const handleIncrement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/visit?action=increment&id=${encodeURIComponent(publicId)}`;
    await callApi(apiUrl, setIncrementResponse);
  };

  const handleGet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/visit?action=get&id=${encodeURIComponent(publicId)}`;
    await callApi(apiUrl, setGetResponse);
  };

  const handleSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token || !setValue) return;

    const apiUrl = `/api/visit?action=set&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}&value=${setValue}`;
    await callApi(apiUrl, setSetResponse);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    const apiUrl = `/api/visit?action=delete&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    await callApi(apiUrl, setDeleteResponse);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    let apiUrl = `/api/visit?action=update&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    await callApi(apiUrl, setUpdateSettingsResponse);
  };

  const handlers = {
    handleCreate,
    handleDisplay,
    handleIncrement,
    handleGet,
    handleSet,
    handleDelete,
    handleUpdateSettings,
  };

  const responses = {
    createResponse,
    displayResponse,
    incrementResponse,
    getResponse,
    setResponse,
    deleteResponse,
    updateSettingsResponse,
  };

  const responseTypes = {
    displayResponse: responseType,
  };

  const renderEmbedCode = () => {
    const attrs = counterEmbedConfig.attributes
      .map((attr) => `${attr.name}="${attr.defaultValue}"`)
      .join(" ");
    return `<script src="${counterEmbedConfig.scriptUrl}"></script>
<${counterEmbedConfig.componentName} id="公開ID" ${attrs}></${counterEmbedConfig.componentName}>`;
  };

  const renderEmbedCodeWithId = () => {
    const attrs = counterEmbedConfig.attributes
      .map((attr) => `${attr.name}="${attr.defaultValue}"`)
      .join(" ");
    return `<script src="${counterEmbedConfig.scriptUrl}"></script>
<${counterEmbedConfig.componentName} id="${publicId}" ${attrs}></${counterEmbedConfig.componentName}>`;
  };

  const renderUsagePage = () => (
    <>
      <div className="nostalgic-title-bar">
        ★ Nostalgic Counter ★
        <br />
        使い方
      </div>

      <StepRenderer
        steps={counterSteps}
        fieldValues={fieldValues}
        handlers={handlers}
        responses={responses}
        responseTypes={responseTypes}
        serviceName="カウンター"
      />

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆STEP 3: カウンター埋め込み◆</b>
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

        {counterEmbedConfig.sections.map((section, idx) => (
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
            {counterEmbedConfig.typescriptType}
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
              <nostalgic-counter
                id="nostalgic-b89803bb"
                type="total"
                theme="light"
                format="image"
                lang={demoLang || undefined}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>Dark</p>
              <nostalgic-counter
                id="nostalgic-b89803bb"
                type="total"
                theme="dark"
                format="image"
                lang={demoLang || undefined}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>Retro</p>
              <nostalgic-counter
                id="nostalgic-b89803bb"
                type="total"
                theme="retro"
                format="image"
                lang={demoLang || undefined}
              />
            </div>
          </div>
        </div>

        {counterEmbedConfig.preview && (
          <div className="nostalgic-section">
            <p>
              <span className="nostalgic-section-title">
                <b>◆このように表示されます◆</b>
              </span>
            </p>
            {publicId ? (
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: "20px",
                    justifyItems: "center",
                    alignItems: "start",
                    maxWidth: "800px",
                    margin: "0 auto",
                  }}
                >
                  {counterEmbedConfig.preview.themes.map((theme) => (
                    <div key={theme.value} style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "14px", marginBottom: "10px" }}>{theme.name}</p>
                      <img
                        src={counterEmbedConfig.preview!.getUrl(publicId, theme.value)}
                        alt={`${theme.name} カウンター`}
                        style={{ border: "1px solid #ccc" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  margin: "20px 0",
                  padding: "20px",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ddd",
                }}
              >
                <p style={{ fontSize: "14px", color: "#666" }}>
                  カウンターを作成すると、ここにプレビューが表示されます
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {publicId && (
        <div className="nostalgic-section">
          <p>
            <span style={{ color: "#ff8c00" }}>
              <b>◆カウンター設置方法◆</b>
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

      <PageFooter servicePath="counter" currentPage="usage" />
    </>
  );

  const renderFeaturesPage = () => (
    <>
      <CounterFeaturesTab />
      <PageFooter servicePath="counter" currentPage="features" />
    </>
  );

  return (
    <NostalgicLayout serviceName="Counter" serviceIcon="🔢">
      {currentPage === "usage" ? renderUsagePage() : renderFeaturesPage()}
    </NostalgicLayout>
  );
}
