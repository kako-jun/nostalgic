import { useState } from "react";
import { useLocation } from "react-router-dom";
import NostalgicLayout from "../components/NostalgicLayout";
import RankingFeaturesTab from "../components/ranking/RankingFeaturesTab";
import StepRenderer from "../components/StepRenderer";
import { PageFooter } from "../components/common";
import { highlightPublicId } from "../components/ApiUrlDisplay";
import { callApi } from "../utils/apiHelpers";
import { rankingSteps } from "../config/services/rankingSteps";
import { rankingEmbedConfig } from "../config/embedConfigs";

export default function RankingPage() {
  const location = useLocation();
  const currentPage = location.pathname === "/ranking/usage" ? "usage" : "features";

  // Field state
  const [publicId, setPublicId] = useState("");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  // Create step additional fields
  const [title, setTitle] = useState("");
  const [maxEntries, setMaxEntries] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // Submit step fields
  const [submitName, setSubmitName] = useState("");
  const [submitScore, setSubmitScore] = useState("");
  const [submitDisplayScore, setSubmitDisplayScore] = useState("");

  // Update step fields
  const [updateName, setUpdateName] = useState("");
  const [updateScore, setUpdateScore] = useState("");
  const [updateDisplayScore, setUpdateDisplayScore] = useState("");

  // Remove step fields
  const [removeName, setRemoveName] = useState("");

  // Settings fields
  const [settingsTitle, setSettingsTitle] = useState("");
  const [settingsMax, setSettingsMax] = useState("");
  const [settingsSortOrder, setSettingsSortOrder] = useState("");
  const [settingsWebhookUrl, setSettingsWebhookUrl] = useState("");

  // Response state
  const [createResponse, setCreateResponse] = useState("");
  const [submitResponse, setSubmitResponse] = useState("");
  const [getResponse, setGetResponse] = useState("");
  const [updateResponse, setUpdateResponse] = useState("");
  const [removeResponse, setRemoveResponse] = useState("");
  const [clearResponse, setClearResponse] = useState("");
  const [deleteResponse, setDeleteResponse] = useState("");
  const [updateSettingsResponse, setUpdateSettingsResponse] = useState("");

  // Language demo state
  const [demoLang, setDemoLang] = useState<"" | "ja" | "en">("");

  // Field values for StepRenderer
  const fieldValues = {
    url: { value: url, onChange: setUrl },
    token: { value: token, onChange: setToken },
    publicId: { value: publicId, onChange: setPublicId },
    webhookUrl: { value: webhookUrl, onChange: setWebhookUrl },
    title: { value: title, onChange: setTitle },
    maxEntries: { value: maxEntries, onChange: setMaxEntries },
    sortOrder: { value: sortOrder, onChange: setSortOrder },
    submitName: { value: submitName, onChange: setSubmitName },
    submitScore: { value: submitScore, onChange: setSubmitScore },
    submitDisplayScore: { value: submitDisplayScore, onChange: setSubmitDisplayScore },
    updateName: { value: updateName, onChange: setUpdateName },
    updateScore: { value: updateScore, onChange: setUpdateScore },
    updateDisplayScore: { value: updateDisplayScore, onChange: setUpdateDisplayScore },
    removeName: { value: removeName, onChange: setRemoveName },
    settingsTitle: { value: settingsTitle, onChange: setSettingsTitle },
    settingsMax: { value: settingsMax, onChange: setSettingsMax },
    settingsSortOrder: { value: settingsSortOrder, onChange: setSettingsSortOrder },
    settingsWebhookUrl: { value: settingsWebhookUrl, onChange: setSettingsWebhookUrl },
  };

  // Handlers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    let apiUrl = `/api/ranking?action=create&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (title) apiUrl += `&title=${encodeURIComponent(title)}`;
    if (maxEntries) apiUrl += `&maxEntries=${maxEntries}`;
    if (sortOrder) apiUrl += `&sortOrder=${sortOrder}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    await callApi(apiUrl, setCreateResponse, setPublicId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId || !submitName || !submitScore) return;

    let apiUrl = `/api/ranking?action=submit&id=${encodeURIComponent(publicId)}&name=${encodeURIComponent(submitName)}&score=${submitScore}`;
    if (submitDisplayScore) apiUrl += `&displayScore=${encodeURIComponent(submitDisplayScore)}`;

    await callApi(apiUrl, setSubmitResponse);
  };

  const handleGet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/ranking?action=get&id=${encodeURIComponent(publicId)}`;
    await callApi(apiUrl, setGetResponse);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId || !updateName || !updateScore) return;

    let apiUrl = `/api/ranking?action=submit&id=${encodeURIComponent(publicId)}&name=${encodeURIComponent(updateName)}&score=${updateScore}`;
    if (updateDisplayScore) apiUrl += `&displayScore=${encodeURIComponent(updateDisplayScore)}`;

    await callApi(apiUrl, setUpdateResponse);
  };

  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token || !removeName) return;

    const apiUrl = `/api/ranking?action=remove&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}&name=${encodeURIComponent(removeName)}`;
    await callApi(apiUrl, setRemoveResponse);
  };

  const handleClear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    const apiUrl = `/api/ranking?action=clear&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    await callApi(apiUrl, setClearResponse);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    const apiUrl = `/api/ranking?action=delete&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    await callApi(apiUrl, setDeleteResponse);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    let apiUrl = `/api/ranking?action=update&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (settingsTitle) apiUrl += `&title=${encodeURIComponent(settingsTitle)}`;
    if (settingsMax) apiUrl += `&maxEntries=${settingsMax}`;
    if (settingsSortOrder) apiUrl += `&sortOrder=${settingsSortOrder}`;
    if (settingsWebhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(settingsWebhookUrl)}`;

    await callApi(apiUrl, setUpdateSettingsResponse);
  };

  const handlers = {
    handleCreate,
    handleSubmit,
    handleGet,
    handleUpdate,
    handleRemove,
    handleClear,
    handleDelete,
    handleUpdateSettings,
  };

  const responses = {
    createResponse,
    submitResponse,
    getResponse,
    updateResponse,
    removeResponse,
    clearResponse,
    deleteResponse,
    updateSettingsResponse,
  };

  const renderEmbedCode = () => {
    const attrs = rankingEmbedConfig.attributes
      .map((attr) => `${attr.name}="${attr.defaultValue}"`)
      .join(" ");
    return `<script src="${rankingEmbedConfig.scriptUrl}"></script>
<${rankingEmbedConfig.componentName} id="公開ID" ${attrs}></${rankingEmbedConfig.componentName}>`;
  };

  const renderEmbedCodeWithId = () => {
    const attrs = rankingEmbedConfig.attributes
      .map((attr) => `${attr.name}="${attr.defaultValue}"`)
      .join(" ");
    return `<script src="${rankingEmbedConfig.scriptUrl}"></script>
<${rankingEmbedConfig.componentName} id="${publicId}" ${attrs}></${rankingEmbedConfig.componentName}>`;
  };

  const renderUsagePage = () => (
    <>
      <div className="nostalgic-title-bar">
        ★ Nostalgic Ranking ★
        <br />
        使い方
      </div>

      <StepRenderer
        steps={rankingSteps}
        fieldValues={fieldValues}
        handlers={handlers}
        responses={responses}
        serviceName="ランキング"
      />

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆STEP 3: ランキング埋め込み◆</b>
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

        {rankingEmbedConfig.sections.map((section, idx) => (
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
            {rankingEmbedConfig.typescriptType}
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
            以下のコンポーネントの表示言語を切り替えます（ローディング・空メッセージ等に反映されます）
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
              <nostalgic-ranking
                id="nostalgic-5e577b5b"
                theme="light"
                limit="3"
                lang={demoLang || undefined}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>Dark</p>
              <nostalgic-ranking
                id="nostalgic-5e577b5b"
                theme="dark"
                limit="3"
                lang={demoLang || undefined}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>Retro</p>
              <nostalgic-ranking
                id="nostalgic-5e577b5b"
                theme="retro"
                limit="3"
                lang={demoLang || undefined}
              />
            </div>
          </div>
        </div>

        {rankingEmbedConfig.demo && publicId && (
          <div className="nostalgic-section">
            <p>
              <span className="nostalgic-section-title">
                <b>◆デモ用ランキング◆</b>
              </span>
            </p>
            <p style={{ marginBottom: "15px" }}>このデモページのランキング（実際に動作します）：</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                justifyItems: "center",
              }}
            >
              {rankingEmbedConfig.demo.themes.map((theme) => (
                <div key={theme.value}>
                  <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>
                    {theme.name}
                  </p>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: `<${rankingEmbedConfig.componentName} id="${publicId}" theme="${theme.value}" limit="5"></${rankingEmbedConfig.componentName}>`,
                    }}
                  />
                </div>
              ))}
            </div>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "15px" }}>
              {rankingEmbedConfig.demo.hint}
            </p>
          </div>
        )}
      </div>

      {publicId && (
        <div className="nostalgic-section">
          <p>
            <span style={{ color: "#ff8c00" }}>
              <b>◆ランキング設置方法◆</b>
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

      <PageFooter servicePath="ranking" currentPage="usage" />
    </>
  );

  const renderFeaturesPage = () => (
    <>
      <RankingFeaturesTab />
      <PageFooter servicePath="ranking" currentPage="features" />
    </>
  );

  return (
    <NostalgicLayout serviceName="Ranking" serviceIcon="🏆">
      {currentPage === "usage" ? renderUsagePage() : renderFeaturesPage()}
    </NostalgicLayout>
  );
}
