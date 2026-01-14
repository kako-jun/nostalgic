import { useState } from "react";
import { useLocation } from "react-router-dom";
import NostalgicLayout from "../components/NostalgicLayout";
import BBSFeaturesTab from "../components/bbs/BBSFeaturesTab";
import StepRenderer from "../components/StepRenderer";
import { PageFooter } from "../components/common";
import { callApi } from "../utils/apiHelpers";
import { bbsSteps } from "../config/services/bbsSteps";
import { bbsEmbedConfig } from "../config/embedConfigs";

export default function BBSPage() {
  const location = useLocation();
  const currentPage = location.pathname === "/bbs/usage" ? "usage" : "features";

  // Field state
  const [publicId, setPublicId] = useState("");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  // Create step additional fields
  const [title, setTitle] = useState("");
  const [maxMessages, setMaxMessages] = useState("");
  const [messagesPerPage, setMessagesPerPage] = useState("");

  // Post step fields
  const [postAuthor, setPostAuthor] = useState("");
  const [postMessage, setPostMessage] = useState("");
  const [standardValue, setStandardValue] = useState("");
  const [incrementalValue, setIncrementalValue] = useState("");
  const [emoteValue, setEmoteValue] = useState("");

  // Message edit/delete fields
  const [messageId, setMessageId] = useState("");
  const [editMessage, setEditMessage] = useState("");

  // Settings fields
  const [settingsTitle, setSettingsTitle] = useState("");
  const [settingsMaxMessages, setSettingsMaxMessages] = useState("");
  const [settingsMessagesPerPage, setSettingsMessagesPerPage] = useState("");
  const [settingsWebhookUrl, setSettingsWebhookUrl] = useState("");
  const [standardSelectLabel, setStandardSelectLabel] = useState("");
  const [standardSelectOptions, setStandardSelectOptions] = useState("");
  const [incrementalSelectLabel, setIncrementalSelectLabel] = useState("");
  const [incrementalSelectOptions, setIncrementalSelectOptions] = useState("");
  const [emoteSelectLabel, setEmoteSelectLabel] = useState("");
  const [emoteSelectOptions, setEmoteSelectOptions] = useState("");

  // Response state
  const [createResponse, setCreateResponse] = useState("");
  const [postResponse, setPostResponse] = useState("");
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
    maxMessages: { value: maxMessages, onChange: setMaxMessages },
    messagesPerPage: { value: messagesPerPage, onChange: setMessagesPerPage },
    postAuthor: { value: postAuthor, onChange: setPostAuthor },
    postMessage: { value: postMessage, onChange: setPostMessage },
    standardValue: { value: standardValue, onChange: setStandardValue },
    incrementalValue: { value: incrementalValue, onChange: setIncrementalValue },
    emoteValue: { value: emoteValue, onChange: setEmoteValue },
    messageId: { value: messageId, onChange: setMessageId },
    editMessage: { value: editMessage, onChange: setEditMessage },
    settingsTitle: { value: settingsTitle, onChange: setSettingsTitle },
    settingsMaxMessages: { value: settingsMaxMessages, onChange: setSettingsMaxMessages },
    settingsMessagesPerPage: {
      value: settingsMessagesPerPage,
      onChange: setSettingsMessagesPerPage,
    },
    settingsWebhookUrl: { value: settingsWebhookUrl, onChange: setSettingsWebhookUrl },
    standardSelectLabel: { value: standardSelectLabel, onChange: setStandardSelectLabel },
    standardSelectOptions: { value: standardSelectOptions, onChange: setStandardSelectOptions },
    incrementalSelectLabel: { value: incrementalSelectLabel, onChange: setIncrementalSelectLabel },
    incrementalSelectOptions: {
      value: incrementalSelectOptions,
      onChange: setIncrementalSelectOptions,
    },
    emoteSelectLabel: { value: emoteSelectLabel, onChange: setEmoteSelectLabel },
    emoteSelectOptions: { value: emoteSelectOptions, onChange: setEmoteSelectOptions },
  };

  // Handlers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    let apiUrl = `/api/bbs?action=create&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (title) apiUrl += `&title=${encodeURIComponent(title)}`;
    if (maxMessages) apiUrl += `&maxMessages=${maxMessages}`;
    if (messagesPerPage) apiUrl += `&messagesPerPage=${messagesPerPage}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    await callApi(apiUrl, setCreateResponse, setPublicId);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId || !postMessage) return;

    let apiUrl = `/api/bbs?action=post&id=${encodeURIComponent(publicId)}&message=${encodeURIComponent(postMessage)}`;
    if (postAuthor) apiUrl += `&author=${encodeURIComponent(postAuthor)}`;
    if (standardValue) apiUrl += `&standardValue=${encodeURIComponent(standardValue)}`;
    if (incrementalValue) apiUrl += `&incrementalValue=${encodeURIComponent(incrementalValue)}`;
    if (emoteValue) apiUrl += `&emoteValue=${encodeURIComponent(emoteValue)}`;

    await callApi(apiUrl, setPostResponse);
  };

  const handleGet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/bbs?action=get&id=${encodeURIComponent(publicId)}`;
    await callApi(apiUrl, setGetResponse);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token || !messageId || !editMessage) return;

    const apiUrl = `/api/bbs?action=update&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}&messageId=${messageId}&message=${encodeURIComponent(editMessage)}`;
    await callApi(apiUrl, setUpdateResponse);
  };

  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token || !messageId) return;

    const apiUrl = `/api/bbs?action=remove&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}&messageId=${messageId}`;
    await callApi(apiUrl, setRemoveResponse);
  };

  const handleClear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    const apiUrl = `/api/bbs?action=clear&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    await callApi(apiUrl, setClearResponse);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    const apiUrl = `/api/bbs?action=delete&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    await callApi(apiUrl, setDeleteResponse);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;

    let apiUrl = `/api/bbs?action=update&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (settingsTitle) apiUrl += `&title=${encodeURIComponent(settingsTitle)}`;
    if (settingsMaxMessages) apiUrl += `&maxMessages=${settingsMaxMessages}`;
    if (settingsMessagesPerPage) apiUrl += `&messagesPerPage=${settingsMessagesPerPage}`;
    if (settingsWebhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(settingsWebhookUrl)}`;
    if (standardSelectLabel) {
      apiUrl += `&standardSelectLabel=${encodeURIComponent(standardSelectLabel)}&standardSelectOptions=${encodeURIComponent(standardSelectOptions)}`;
    }
    if (incrementalSelectLabel) {
      apiUrl += `&incrementalSelectLabel=${encodeURIComponent(incrementalSelectLabel)}&incrementalSelectOptions=${encodeURIComponent(incrementalSelectOptions)}`;
    }
    if (emoteSelectLabel) {
      apiUrl += `&emoteSelectLabel=${encodeURIComponent(emoteSelectLabel)}&emoteSelectOptions=${encodeURIComponent(emoteSelectOptions)}`;
    }

    await callApi(apiUrl, setUpdateSettingsResponse);
  };

  const handleEditMessageById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId || !messageId || !editMessage) return;

    const apiUrl = `/api/bbs?action=update&id=${encodeURIComponent(publicId)}&messageId=${messageId}&message=${encodeURIComponent(editMessage)}`;
    await callApi(apiUrl, setUpdateResponse);
  };

  const handleDeleteMessageById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId || !messageId) return;

    const apiUrl = `/api/bbs?action=remove&id=${encodeURIComponent(publicId)}&messageId=${messageId}`;
    await callApi(apiUrl, setRemoveResponse);
  };

  const handlers = {
    handleCreate,
    handlePost,
    handleGet,
    handleUpdate,
    handleRemove,
    handleClear,
    handleDelete,
    handleUpdateSettings,
    handleEditMessageById,
    handleDeleteMessageById,
  };

  const responses = {
    createResponse,
    postResponse,
    getResponse,
    updateResponse,
    removeResponse,
    clearResponse,
    deleteResponse,
    updateSettingsResponse,
  };

  const renderEmbedCode = () => {
    const attrs = bbsEmbedConfig.attributes
      .map((attr) => `${attr.name}="${attr.defaultValue}"`)
      .join(" ");
    return `<script src="${bbsEmbedConfig.scriptUrl}"></script>
<${bbsEmbedConfig.componentName} id="公開ID" ${attrs}></${bbsEmbedConfig.componentName}>`;
  };

  const renderEmbedCodeWithId = () => {
    const attrs = bbsEmbedConfig.attributes
      .map((attr) => `${attr.name}="${attr.defaultValue}"`)
      .join(" ");
    return `<script src="${bbsEmbedConfig.scriptUrl}"></script>
<${bbsEmbedConfig.componentName} id="${publicId}" ${attrs}></${bbsEmbedConfig.componentName}>`;
  };

  const renderUsagePage = () => (
    <>
      <div className="nostalgic-title-bar">
        ★ Nostalgic BBS ★
        <br />
        使い方
      </div>

      <StepRenderer
        steps={bbsSteps}
        fieldValues={fieldValues}
        handlers={handlers}
        responses={responses}
        serviceName="掲示板"
      />

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆STEP 3: 掲示板埋め込み◆</b>
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

        {bbsEmbedConfig.sections.map((section, idx) => (
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
            {bbsEmbedConfig.typescriptType}
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
            以下のコンポーネントの表示言語を切り替えます（UI全般に反映されます）
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
              <nostalgic-bbs
                id="nostalgic-1cc54837"
                theme="light"
                limit="3"
                lang={demoLang || undefined}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "20px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>Dark</p>
              <nostalgic-bbs
                id="nostalgic-4e2986a2"
                theme="dark"
                limit="3"
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
              <b>◆掲示板設置方法◆</b>
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

      <PageFooter servicePath="bbs" currentPage="usage" />
    </>
  );

  const renderFeaturesPage = () => (
    <>
      <BBSFeaturesTab />
      <PageFooter servicePath="bbs" currentPage="features" />
    </>
  );

  return (
    <NostalgicLayout serviceName="BBS" serviceIcon="💬">
      {currentPage === "usage" ? renderUsagePage() : renderFeaturesPage()}
    </NostalgicLayout>
  );
}
