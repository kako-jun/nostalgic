import { useState } from "react";
import { useLocation } from "react-router-dom";
import ServicePageTemplate from "../components/ServicePageTemplate";
import BBSFeaturesTab from "../components/bbs/BBSFeaturesTab";
import { callApi } from "../utils/apiHelpers";
import { getBBSFormSections } from "../config/bbsFormConfig";
import { bbsEmbedConfig } from "../config/embedConfigs";

export default function BBSPage() {
  const location = useLocation();
  const currentPage = location.pathname === "/bbs/usage" ? "usage" : "features";
  const [publicId, setPublicId] = useState("");
  const [sharedUrl, setSharedUrl] = useState("");
  const [sharedToken, setSharedToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const [_title, _setTitle] = useState("");
  const [maxMessages, setMaxMessages] = useState("");
  const [messagesPerPage, _setMessagesPerPage] = useState("");

  const [standardSelectLabel, _setStandardSelectLabel] = useState("");
  const [standardSelectOptions, _setStandardSelectOptions] = useState("");
  const [incrementalSelectLabel, _setIncrementalSelectLabel] = useState("");
  const [incrementalSelectOptions, _setIncrementalSelectOptions] = useState("");
  const [emoteSelectLabel, _setEmoteSelectLabel] = useState("");
  const [emoteSelectOptions, _setEmoteSelectOptions] = useState("");

  const [postAuthor, setPostAuthor] = useState("");
  const [postMessage, setPostMessage] = useState("");
  const [standardValue, setStandardValue] = useState("");
  const [incrementalValue, setIncrementalValue] = useState("");
  const [emoteValue, setEmoteValue] = useState("");

  const [messageId, setMessageId] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editToken, setEditToken] = useState("");
  const [editStandardValue, setEditStandardValue] = useState("");
  const [editIncrementalValue, setEditIncrementalValue] = useState("");
  const [editEmoteValue, setEditEmoteValue] = useState("");

  const [createResponse, setCreateResponse] = useState("");
  const [postResponse, setPostResponse] = useState("");
  const [getResponse, setGetResponse] = useState("");
  const [updateResponse, setUpdateResponse] = useState("");
  const [removeResponse, setRemoveResponse] = useState("");
  const [clearResponse, setClearResponse] = useState("");
  const [deleteResponse, setDeleteResponse] = useState("");
  const [updateSettingsResponse, setUpdateSettingsResponse] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    let apiUrl = `/api/bbs?action=create&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (maxMessages) apiUrl += `&max=${maxMessages}`;
    if (messagesPerPage) apiUrl += `&perPage=${messagesPerPage}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;
    if (standardSelectLabel && standardSelectOptions) {
      apiUrl += `&standardSelectLabel=${encodeURIComponent(standardSelectLabel)}&standardSelectOptions=${encodeURIComponent(standardSelectOptions)}`;
    }
    if (incrementalSelectLabel && incrementalSelectOptions) {
      apiUrl += `&incrementalSelectLabel=${encodeURIComponent(incrementalSelectLabel)}&incrementalSelectOptions=${encodeURIComponent(incrementalSelectOptions)}`;
    }
    if (emoteSelectLabel && emoteSelectOptions) {
      apiUrl += `&emoteSelectLabel=${encodeURIComponent(emoteSelectLabel)}&emoteSelectOptions=${encodeURIComponent(emoteSelectOptions)}`;
    }

    await callApi(apiUrl, setCreateResponse, setPublicId);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId || !postMessage) return;

    let apiUrl = `/api/bbs?action=post&id=${encodeURIComponent(publicId)}&message=${encodeURIComponent(postMessage)}`;
    if (postAuthor) apiUrl += `&author=${encodeURIComponent(postAuthor)}`;
    if (standardValue) apiUrl += `&select1=${encodeURIComponent(standardValue)}`;
    if (incrementalValue) apiUrl += `&select2=${encodeURIComponent(incrementalValue)}`;
    if (emoteValue) apiUrl += `&icon=${encodeURIComponent(emoteValue)}`;

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
    if (!sharedUrl || !sharedToken || !messageId || !editMessage) return;

    const apiUrl = `/api/bbs?action=update&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&messageId=${messageId}&message=${encodeURIComponent(editMessage)}`;
    await callApi(apiUrl, setUpdateResponse);
  };

  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken || !messageId) return;

    const apiUrl = `/api/bbs?action=remove&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&messageId=${messageId}`;
    await callApi(apiUrl, setRemoveResponse);
  };

  const handleClear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    const apiUrl = `/api/bbs?action=clear&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    await callApi(apiUrl, setClearResponse);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    const apiUrl = `/api/bbs?action=delete&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    await callApi(apiUrl, setDeleteResponse);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken) return;

    let apiUrl = `/api/bbs?action=update&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (maxMessages) apiUrl += `&maxMessages=${maxMessages}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

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

  const formSections = getBBSFormSections({
    publicId,
    sharedUrl,
    sharedToken,
    maxMessages,
    setMaxMessages,
    webhookUrl,
    setWebhookUrl,
    postAuthor,
    postMessage,
    standardValue,
    incrementalValue,
    emoteValue,
    messageId,
    editAuthor,
    editMessage,
    editToken,
    editStandardValue,
    editIncrementalValue,
    editEmoteValue,
    setPostAuthor,
    setPostMessage,
    setStandardValue,
    setIncrementalValue,
    setEmoteValue,
    setMessageId,
    setEditAuthor,
    setEditMessage,
    setEditToken,
    setEditStandardValue,
    setEditIncrementalValue,
    setEditEmoteValue,
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
    createResponse,
    postResponse,
    getResponse,
    updateResponse,
    removeResponse,
    clearResponse,
    deleteResponse,
    updateSettingsResponse,
  });

  return (
    <ServicePageTemplate
      serviceName="掲示板"
      serviceDisplayName="BBS"
      serviceIcon="💬"
      servicePath="bbs"
      apiEndpoint="/api/bbs"
      currentPage={currentPage}
      FeaturesTab={BBSFeaturesTab}
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
      embedConfig={bbsEmbedConfig}
    />
  );
}
