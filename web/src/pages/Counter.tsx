import { useState } from "react";
import { useLocation } from "react-router-dom";
import NostalgicLayout from "../components/NostalgicLayout";
import CounterFeaturesTab from "../components/counter/CounterFeaturesTab";
import CreateServiceSection from "../components/sections/CreateServiceSection";
import DataDrivenFormSection from "../components/DataDrivenFormSection";
import { callApi, callApiWithFormat } from "../utils/apiHelpers";
import { getCounterFormSections } from "../config/counterFormConfig";

export default function CounterPage() {
  const location = useLocation();
  const currentPage = location.pathname === "/counter/usage" ? "usage" : "features";
  const [publicId, setPublicId] = useState("");
  const [responseType, setResponseType] = useState<"json" | "text" | "svg">("json");
  const [sharedUrl, setSharedUrl] = useState("");
  const [sharedToken, setSharedToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("json");
  const [setValue, setSetValue] = useState("");

  const [createResponse, setCreateResponse] = useState("");
  const [displayResponse, setDisplayResponse] = useState("");
  const [toggleResponse, setToggleResponse] = useState("");
  const [getResponse, setGetResponse] = useState("");
  const [setValueResponse, setSetValueResponse] = useState("");
  const [deleteResponse, setDeleteResponse] = useState("");
  const [updateSettingsResponse, setUpdateSettingsResponse] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    let apiUrl = `/api/visit?action=create&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    await callApi(apiUrl, setCreateResponse, setPublicId);
  };

  const handleDisplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/visit?action=display&id=${encodeURIComponent(publicId)}&type=${selectedFormat.replace("json", "total").replace("text", "total").replace("svg", "total")}&format=${selectedFormat}`;
    await callApiWithFormat(
      apiUrl,
      selectedFormat as "json" | "text" | "svg",
      setDisplayResponse,
      setResponseType
    );
  };

  const handleToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    const apiUrl = `/api/visit?action=increment&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    await callApi(apiUrl, setToggleResponse);
  };

  const handleGet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/visit?action=get&id=${encodeURIComponent(publicId)}`;
    await callApi(apiUrl, setGetResponse);
  };

  const handleSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken || !setValue) return;

    const apiUrl = `/api/visit?action=set&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&value=${setValue}`;
    await callApi(apiUrl, setSetValueResponse);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    const apiUrl = `/api/visit?action=delete&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    await callApi(apiUrl, setDeleteResponse);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    let apiUrl = `/api/visit?action=updateSettings&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    await callApi(apiUrl, setUpdateSettingsResponse);
  };

  const formSections = getCounterFormSections(
    sharedUrl,
    setSharedUrl,
    sharedToken,
    setSharedToken,
    publicId,
    setPublicId,
    webhookUrl,
    setWebhookUrl,
    selectedFormat,
    setSelectedFormat,
    setValue,
    setSetValue,
    {
      handleCreate,
      handleDisplay,
      handleToggle,
      handleGet,
      handleSet,
      handleUpdateSettings,
      handleDelete,
    },
    {
      createResponse,
      displayResponse,
      toggleResponse,
      getResponse,
      setValueResponse,
      updateSettingsResponse,
      deleteResponse,
    },
    responseType
  );

  const renderContent = () => {
    switch (currentPage) {
      case "usage":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic Counter ★
              <br />
              使い方
            </div>

            <CreateServiceSection
              serviceName="カウンター"
              apiEndpoint="/api/visit"
              sharedUrl={sharedUrl}
              setSharedUrl={setSharedUrl}
              sharedToken={sharedToken}
              setSharedToken={setSharedToken}
              webhookUrl={webhookUrl}
              setWebhookUrl={setWebhookUrl}
              onCreateSubmit={handleCreate}
              createResponse={createResponse}
            />

            {formSections.map((section, index) => (
              <DataDrivenFormSection key={index} {...section} />
            ))}

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 3: いいねボタン埋め込み◆</b>
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
                {`<script src="https://nostalgic.llll-ll.com/components/like.js"></script>
<nostalgic-like id="`}
                <span style={{ color: "#008000" }}>公開ID</span>
                {`" theme="`}
                <span style={{ color: "#008000" }}>dark</span>
                {`" icon="`}
                <span style={{ color: "#008000" }}>heart</span>
                {`"></nostalgic-like>`}
              </pre>

              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆format 表示形式◆</b>
                  </span>
                </p>
                <p>
                  • <span style={{ color: "#008000" }}>interactive</span> -
                  インタラクティブボタン（デフォルト）
                  <br />• <span style={{ color: "#008000" }}>text</span> - 数値のみ表示
                  <br />• <span style={{ color: "#008000" }}>image</span> - SVG画像形式
                </p>
              </div>

              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆theme デザインテーマ◆</b>
                  </span>
                </p>
                <p>
                  • <span style={{ color: "#008000" }}>light</span> - ライト（白系モノクロ）
                  <br />• <span style={{ color: "#008000" }}>dark</span> - ダーク（黒系モノクロ）
                  <br />• <span style={{ color: "#008000" }}>retro</span> -
                  レトロ（古いコンピュータ画面風）
                  <br />• <span style={{ color: "#008000" }}>kawaii</span> -
                  かわいい（ファンシー系）
                  <br />• <span style={{ color: "#008000" }}>mom</span> - Mother味（緑チェック模様）
                  <br />• <span style={{ color: "#008000" }}>final</span> - FF味（青系）
                </p>
              </div>

              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆icon アイコンタイプ◆</b>
                  </span>
                </p>
                <p>
                  • <span style={{ color: "#008000" }}>heart</span> - ハート（♥）
                  <br />• <span style={{ color: "#008000" }}>star</span> - スター（★）
                  <br />• <span style={{ color: "#008000" }}>thumb</span> - サムズアップ（👍）
                </p>
              </div>

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
                  {`// types.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-like': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        theme?: 'light' | 'dark' | 'retro' | 'kawaii' | 'mom' | 'final';
        icon?: 'heart' | 'star' | 'thumb';
      };
    }
  }
}`}
                </pre>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  ※この設定により、TypeScriptでWeb
                  Componentsを使用してもビルドエラーが発生しません。
                </p>
              </div>
            </div>

            {publicId && (
              <div className="nostalgic-section">
                <p>
                  <span style={{ color: "#ff8c00" }}>
                    <b>◆いいねボタン設置方法◆</b>
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
                  {`<script src="https://nostalgic.llll-ll.com/components/like.js"></script>
<nostalgic-like id="${publicId}" theme="dark" icon="heart"></nostalgic-like>`}
                </p>
              </div>
            )}

            <hr />

            <p style={{ textAlign: "center" }}>
              これ以上の詳しい説明は{" "}
              <a
                href="https://github.com/kako-jun/nostalgic/blob/main/README_ja.md"
                className="nostalgic-old-link"
              >
                【GitHub】
              </a>{" "}
              へ
            </p>
          </>
        );

      case "features":
        return <CounterFeaturesTab />;

      default:
        return null;
    }
  };

  return (
    <NostalgicLayout serviceName="Counter" serviceIcon="🔢">
      {renderContent()}
    </NostalgicLayout>
  );
}
