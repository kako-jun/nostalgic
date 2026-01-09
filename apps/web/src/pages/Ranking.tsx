import { useState } from "react";
import { useLocation } from "react-router-dom";
import ServicePageTemplate from "../components/ServicePageTemplate";
import RankingFeaturesTab from "../components/ranking/RankingFeaturesTab";
import { callApi } from "../utils/apiHelpers";
import { getRankingFormSections } from "../config/rankingFormConfig";
import { rankingEmbedConfig } from "../config/embedConfigs";

export default function RankingPage() {
  const location = useLocation();
  const currentPage = location.pathname === "/ranking/usage" ? "usage" : "features";
  const [publicId, setPublicId] = useState("");
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    let apiUrl = `/api/ranking?action=create&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
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

    // Use submit action for UPSERT (update is now settings-only)
    let apiUrl = `/api/ranking?action=submit&id=${encodeURIComponent(publicId)}&name=${encodeURIComponent(updateName)}&score=${updateScore}`;
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

    let apiUrl = `/api/ranking?action=update&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (settingsTitle) apiUrl += `&title=${encodeURIComponent(settingsTitle)}`;
    if (settingsMax) apiUrl += `&maxEntries=${settingsMax}`;
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
      handleUpdateSettings,
      handleDelete,
    },
    {
      createResponse,
      submitResponse,
      getResponse,
      updateResponse,
      removeResponse,
      clearResponse,
      updateSettingsResponse,
      deleteResponse,
    }
  );

  const createSectionChildren = (
    <>
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
    </>
  );

  return (
    <ServicePageTemplate
      serviceName="ランキング"
      serviceDisplayName="Ranking"
      serviceIcon="🏆"
      servicePath="ranking"
      apiEndpoint="/api/ranking"
      currentPage={currentPage}
      FeaturesTab={RankingFeaturesTab}
      sharedUrl={sharedUrl}
      setSharedUrl={setSharedUrl}
      sharedToken={sharedToken}
      setSharedToken={setSharedToken}
      webhookUrl={webhookUrl}
      setWebhookUrl={setWebhookUrl}
      onCreateSubmit={handleCreate}
      createResponse={createResponse}
      createSectionChildren={createSectionChildren}
      publicId={publicId}
      formSections={formSections}
      embedConfig={rankingEmbedConfig}
    />
  );
}
