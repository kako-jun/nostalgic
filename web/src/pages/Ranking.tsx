import { useState } from "react";
import NostalgicLayout from "../components/NostalgicLayout";
import TabNavigation from "../components/TabNavigation";
import RankingFeaturesTab from "../components/ranking/RankingFeaturesTab";
import CreateServiceSection from "../components/sections/CreateServiceSection";
import DataDrivenFormSection from "../components/DataDrivenFormSection";
import useHashNavigation from "../hooks/useHashNavigation";
import { callApi } from "../utils/apiHelpers";
import { getRankingFormSections } from "../config/rankingFormConfig";

const TABS = [
  { id: "features", label: "機能" },
  { id: "usage", label: "使い方" },
];

export default function RankingPage() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || "features";
  });
  const [publicId, setPublicId] = useState("");
  const [responseType] = useState<"json" | "text" | "svg">("json");
  const [sharedUrl, setSharedUrl] = useState("");
  const [sharedToken, setSharedToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  // Ranking specific states
  const [title, setTitle] = useState("");
  const [maxEntries, setMaxEntries] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [submitName, setSubmitName] = useState("");
  const [submitScore, setSubmitScore] = useState("");
  const [submitDisplayScore, setSubmitDisplayScore] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateScore, setUpdateScore] = useState("");
  const [updateDisplayScore, setUpdateDisplayScore] = useState("");
  const [removeName, setRemoveName] = useState("");
  const [settingsTitle, setSettingsTitle] = useState("");
  const [settingsMax, setSettingsMax] = useState("");
  const [settingsSortOrder, setSettingsSortOrder] = useState("");
  const [settingsWebhookUrl, setSettingsWebhookUrl] = useState("");

  const [createResponse, setCreateResponse] = useState("");
  const [submitResponse, setSubmitResponse] = useState("");
  const [getResponse, setGetResponse] = useState("");
  const [updateResponse, setUpdateResponse] = useState("");
  const [removeResponse, setRemoveResponse] = useState("");
  const [clearResponse, setClearResponse] = useState("");
  const [deleteResponse, setDeleteResponse] = useState("");
  const [updateSettingsResponse, setUpdateSettingsResponse] = useState("");

  useHashNavigation(currentPage, setCurrentPage);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    let apiUrl = `/api/ranking?action=create&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (title) apiUrl += `&title=${encodeURIComponent(title)}`;
    if (maxEntries) apiUrl += `&max=${maxEntries}`;
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
    if (!sharedUrl || !sharedToken || !updateName || !updateScore) return;

    let apiUrl = `/api/ranking?action=update&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&name=${encodeURIComponent(updateName)}&score=${updateScore}`;
    if (updateDisplayScore) apiUrl += `&displayScore=${encodeURIComponent(updateDisplayScore)}`;

    await callApi(apiUrl, setUpdateResponse);
  };

  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken || !removeName) return;

    const apiUrl = `/api/ranking?action=remove&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&name=${encodeURIComponent(removeName)}`;
    await callApi(apiUrl, setRemoveResponse);
  };

  const handleClear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    const apiUrl = `/api/ranking?action=clear&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    await callApi(apiUrl, setClearResponse);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    const apiUrl = `/api/ranking?action=delete&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    await callApi(apiUrl, setDeleteResponse);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    let apiUrl = `/api/ranking?action=updateSettings&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (settingsTitle) apiUrl += `&title=${encodeURIComponent(settingsTitle)}`;
    if (settingsMax) apiUrl += `&max=${settingsMax}`;
    if (settingsSortOrder) apiUrl += `&sortOrder=${settingsSortOrder}`;
    if (settingsWebhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(settingsWebhookUrl)}`;

    await callApi(apiUrl, setUpdateSettingsResponse);
  };

  const formSections = getRankingFormSections(
    sharedUrl,
    setSharedUrl,
    sharedToken,
    setSharedToken,
    publicId,
    setPublicId,
    webhookUrl,
    setWebhookUrl,
    title,
    setTitle,
    maxEntries,
    setMaxEntries,
    sortOrder,
    setSortOrder,
    submitName,
    setSubmitName,
    submitScore,
    setSubmitScore,
    submitDisplayScore,
    setSubmitDisplayScore,
    updateName,
    setUpdateName,
    updateScore,
    setUpdateScore,
    updateDisplayScore,
    setUpdateDisplayScore,
    removeName,
    setRemoveName,
    settingsTitle,
    setSettingsTitle,
    settingsMax,
    setSettingsMax,
    settingsSortOrder,
    setSettingsSortOrder,
    settingsWebhookUrl,
    setSettingsWebhookUrl,
    {
      handleCreate,
      handleSubmit,
      handleGet,
      handleUpdate,
      handleRemove,
      handleClear,
      handleDelete,
      handleUpdateSettings,
    },
    {
      createResponse,
      submitResponse,
      getResponse,
      updateResponse,
      removeResponse,
      clearResponse,
      deleteResponse,
      updateSettingsResponse,
    },
    responseType
  );

  const renderContent = () => {
    switch (currentPage) {
      case "usage":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic Ranking ★
              <br />
              使い方
            </div>

            <CreateServiceSection
              serviceName="ランキング"
              apiEndpoint="/api/ranking"
              sharedUrl={sharedUrl}
              setSharedUrl={setSharedUrl}
              sharedToken={sharedToken}
              setSharedToken={setSharedToken}
              webhookUrl={webhookUrl}
              setWebhookUrl={setWebhookUrl}
              onCreateSubmit={handleCreate}
              createResponse={createResponse}
            >
              <p>
                <b>タイトル（オプション）：</b>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  placeholder="ランキングのタイトル"
                  style={{
                    width: "60%",
                    padding: "4px",
                    border: "1px solid #666",
                    fontFamily: "inherit",
                    fontSize: "16px",
                  }}
                />
              </p>
              <p>
                <b>最大エントリー数（オプション）：</b>
                <input
                  value={maxEntries}
                  onChange={(e) => setMaxEntries(e.target.value)}
                  type="number"
                  min="1"
                  placeholder="100"
                  style={{
                    width: "30%",
                    padding: "4px",
                    border: "1px solid #666",
                    fontFamily: "inherit",
                    fontSize: "16px",
                  }}
                />
              </p>
              <p>
                <b>ソート順（オプション）：</b>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    width: "30%",
                    padding: "4px",
                    border: "1px solid #666",
                    fontFamily: "inherit",
                    fontSize: "16px",
                  }}
                >
                  <option value="desc">降順（高い順）</option>
                  <option value="asc">昇順（低い順）</option>
                </select>
              </p>
            </CreateServiceSection>

            {formSections.map((section, index) => (
              <DataDrivenFormSection key={index} {...section} />
            ))}

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
                  {`<script src="https://nostalgic.llll-ll.com/components/ranking.js"></script>
<nostalgic-ranking id="${publicId}" theme="dark"></nostalgic-ranking>`}
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
        return <RankingFeaturesTab />;

      default:
        return null;
    }
  };

  return (
    <NostalgicLayout serviceName="Ranking" serviceIcon="🏆">
      <TabNavigation tabs={TABS} currentTab={currentPage} onTabChange={setCurrentPage} />
      {renderContent()}
    </NostalgicLayout>
  );
}
