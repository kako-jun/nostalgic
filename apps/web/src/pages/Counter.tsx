import { useState } from "react";
import { useLocation } from "react-router-dom";
import ServicePageTemplate from "../components/ServicePageTemplate";
import CounterFeaturesTab from "../components/counter/CounterFeaturesTab";
import { callApi, callApiWithFormat } from "../utils/apiHelpers";
import { getCounterFormSections } from "../config/counterFormConfig";
import { counterEmbedConfig } from "../config/embedConfigs";

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
  const [incrementResponse, setIncrementResponse] = useState("");
  const [getResponse, setGetResponse] = useState("");
  const [setResponse, setSetResponse] = useState("");
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

  const handleIncrement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    const apiUrl = `/api/visit?action=increment&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
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
    if (!sharedUrl || !sharedToken || !setValue) return;

    const apiUrl = `/api/visit?action=set&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&value=${setValue}`;
    await callApi(apiUrl, setSetResponse);
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
      handleIncrement,
      handleGet,
      handleSet,
      handleUpdateSettings,
      handleDelete,
    },
    {
      createResponse,
      displayResponse,
      incrementResponse,
      getResponse,
      setResponse,
      updateSettingsResponse,
      deleteResponse,
    },
    responseType
  );

  return (
    <ServicePageTemplate
      serviceName="カウンター"
      serviceDisplayName="Counter"
      serviceIcon="🔢"
      servicePath="counter"
      apiEndpoint="/api/visit"
      currentPage={currentPage}
      FeaturesTab={CounterFeaturesTab}
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
      embedConfig={counterEmbedConfig}
    />
  );
}
