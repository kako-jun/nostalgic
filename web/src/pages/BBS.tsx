import { useState } from "react";
import NostalgicLayout from "../components/NostalgicLayout";
import TabNavigation from "../components/TabNavigation";
import BBSFeaturesTab from "../components/bbs/BBSFeaturesTab";
import CreateServiceSection from "../components/sections/CreateServiceSection";
import DataDrivenFormSection from "../components/DataDrivenFormSection";
import useHashNavigation from "../hooks/useHashNavigation";
import { callApi } from "../utils/apiHelpers";
import { getBBSFormSections } from "../config/bbsFormConfig";

const TABS = [
  { id: "features", label: "機能" },
  { id: "usage", label: "使い方" },
];

export default function BBSPage() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || "features";
  });
  const [publicId, setPublicId] = useState("");
  const [sharedUrl, setSharedUrl] = useState("");
  const [sharedToken, setSharedToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const [title, _setTitle] = useState("");
  const [maxMessages, _setMaxMessages] = useState("");
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

  useHashNavigation(currentPage, setCurrentPage);

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
    if (!sharedUrl || !sharedToken || !postAuthor || !postMessage) return;

    let apiUrl = `/api/bbs?action=post&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&author=${encodeURIComponent(postAuthor)}&message=${encodeURIComponent(postMessage)}`;
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
    if (!sharedUrl || !sharedToken || !messageId || !editAuthor || !editMessage) return;

    let apiUrl = `/api/bbs?action=editMessage&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&messageId=${messageId}&author=${encodeURIComponent(editAuthor)}&message=${encodeURIComponent(editMessage)}`;
    if (editStandardValue) apiUrl += `&standardValue=${encodeURIComponent(editStandardValue)}`;
    if (editIncrementalValue)
      apiUrl += `&incrementalValue=${encodeURIComponent(editIncrementalValue)}`;
    if (editEmoteValue) apiUrl += `&emoteValue=${encodeURIComponent(editEmoteValue)}`;

    await callApi(apiUrl, setUpdateResponse);
  };

  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedUrl || !sharedToken || !messageId) return;

    const apiUrl = `/api/bbs?action=deleteMessage&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}&messageId=${messageId}`;
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

    let apiUrl = `/api/bbs?action=updateSettings&url=${encodeURIComponent(sharedUrl)}&token=${encodeURIComponent(sharedToken)}`;
    if (title) apiUrl += `&title=${encodeURIComponent(title)}`;
    if (maxMessages) apiUrl += `&maxMessages=${maxMessages}`;
    if (messagesPerPage) apiUrl += `&messagesPerPage=${messagesPerPage}`;
    if (standardSelectLabel && standardSelectOptions) {
      apiUrl += `&standardSelectLabel=${encodeURIComponent(standardSelectLabel)}&standardSelectOptions=${encodeURIComponent(standardSelectOptions)}`;
    }
    if (incrementalSelectLabel && incrementalSelectOptions) {
      apiUrl += `&incrementalSelectLabel=${encodeURIComponent(incrementalSelectLabel)}&incrementalSelectOptions=${encodeURIComponent(incrementalSelectOptions)}`;
    }
    if (emoteSelectLabel && emoteSelectOptions) {
      apiUrl += `&emoteSelectLabel=${encodeURIComponent(emoteSelectLabel)}&emoteSelectOptions=${encodeURIComponent(emoteSelectOptions)}`;
    }
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;

    await callApi(apiUrl, setUpdateSettingsResponse);
  };

  const handleEditMessageById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId || !messageId || !editAuthor || !editMessage || !editToken) return;

    let apiUrl = `/api/bbs?action=editMessageById&id=${encodeURIComponent(publicId)}&messageId=${messageId}&author=${encodeURIComponent(editAuthor)}&message=${encodeURIComponent(editMessage)}&editToken=${encodeURIComponent(editToken)}`;
    if (editStandardValue) apiUrl += `&standardValue=${encodeURIComponent(editStandardValue)}`;
    if (editIncrementalValue)
      apiUrl += `&incrementalValue=${encodeURIComponent(editIncrementalValue)}`;
    if (editEmoteValue) apiUrl += `&emoteValue=${encodeURIComponent(editEmoteValue)}`;

    await callApi(apiUrl, setUpdateResponse);
  };

  const handleDeleteMessageById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId || !messageId || !editToken) return;

    const apiUrl = `/api/bbs?action=deleteMessageById&id=${encodeURIComponent(publicId)}&messageId=${messageId}&editToken=${encodeURIComponent(editToken)}`;
    await callApi(apiUrl, setRemoveResponse);
  };

  const formSections = getBBSFormSections({
    publicId,
    sharedUrl,
    sharedToken,
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
    handlePost,
    handleGet,
    handleUpdate,
    handleRemove,
    handleClear,
    handleDelete,
    handleUpdateSettings,
    handleEditMessageById,
    handleDeleteMessageById,
    postResponse,
    getResponse,
    updateResponse,
    removeResponse,
    clearResponse,
    deleteResponse,
    updateSettingsResponse,
  });

  const renderContent = () => {
    switch (currentPage) {
      case "usage":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic BBS ★
              <br />
              使い方
            </div>

            <CreateServiceSection
              serviceName="掲示板"
              apiEndpoint="/api/bbs"
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
                {`<script src="https://nostalgic.llll-ll.com/components/bbs.js"></script>
<nostalgic-bbs id="`}
                <span style={{ color: "#008000" }}>公開ID</span>
                {`" theme="`}
                <span style={{ color: "#008000" }}>dark</span>
                {`"></nostalgic-bbs>`}
              </pre>
            </div>
          </>
        );

      case "features":
      default:
        return <BBSFeaturesTab />;
    }
  };

  return (
    <>
      <NostalgicLayout serviceIcon="💬">
        <TabNavigation tabs={TABS} currentTab={currentPage} onTabChange={setCurrentPage} />
        {renderContent()}
      </NostalgicLayout>
    </>
  );
}
