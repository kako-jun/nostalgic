import { useState } from "react";
import { useLocation } from "react-router-dom";
import ServicePageTemplate from "../components/ServicePageTemplate";
import LikeFeaturesTab from "../components/like/LikeFeaturesTab";
import { callApi, callApiWithFormat } from "../utils/apiHelpers";
import { getLikeFormSections } from "../config/likeFormConfig";
import { likeEmbedConfig } from "../config/embedConfigs";

export default function LikePage() {
  const location = useLocation();
  const currentPage = location.pathname === "/like/usage" ? "usage" : "features";

  const [publicId, setPublicId] = useState("");
  const [responseType, setResponseType] = useState<"json" | "text" | "svg">("json");
  const [sharedUrl, setSharedUrl] = useState("");
  const [sharedToken, setSharedToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("json");

  const [createResponse, setCreateResponse] = useState("");
  const [displayResponse, setDisplayResponse] = useState("");
  const [toggleResponse, setToggleResponse] = useState("");
  const [getResponse, setGetResponse] = useState("");
  const [deleteResponse, setDeleteResponse] = useState("");
  const [updateSettingsResponse, setUpdateSettingsResponse] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    let apiUrl = `/api/like?action=create&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    await callApi(apiUrl, setCreateResponse, setPublicId);
  };

  const handleDisplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) return;

    const apiUrl = `/api/like?action=get&id=${encodeURIComponent(publicId)}`;
    await callApiWithFormat(
      apiUrl,
      selectedFormat as "json" | "text" | "svg",
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
    if (!sharedUrl || !sharedToken) return;

    const apiUrl = `/api/like?action=delete&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    await callApi(apiUrl, setDeleteResponse);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    let apiUrl = `/api/like?action=update&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    await callApi(apiUrl, setUpdateSettingsResponse);
  };

  const formSections = getLikeFormSections(
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
    {
      handleCreate,
      handleDisplay,
      handleToggle,
      handleGet,
      handleUpdateSettings,
      handleDelete,
    },
    {
      createResponse,
      displayResponse,
      toggleResponse,
      getResponse,
      updateSettingsResponse,
      deleteResponse,
    },
    responseType
  );

  return (
    <ServicePageTemplate
      serviceName="いいね"
      serviceDisplayName="Like"
      serviceIcon="💖"
      servicePath="like"
      apiEndpoint="/api/like"
      currentPage={currentPage}
      FeaturesTab={LikeFeaturesTab}
      sharedUrl={sharedUrl}
      setSharedUrl={setSharedUrl}
      sharedToken={sharedToken}
      setSharedToken={setSharedToken}
      webhookUrl={webhookUrl}
      setWebhookUrl={setWebhookUrl}
      onCreateSubmit={handleCreate}
      createResponse={createResponse}
      publicId={publicId}
      formSections={formSections}
      embedConfig={likeEmbedConfig}
    />
  );
}
