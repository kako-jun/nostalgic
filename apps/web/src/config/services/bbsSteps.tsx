import { GreenParam } from "../../components/ApiUrlDisplay";
import { API_BASE, COMMON_FIELDS, type StepConfig } from "../commonSteps";

const ENDPOINT = "/bbs";

// Create step (STEP 1) - with additional fields for BBS
const createStep: StepConfig = {
  id: "create",
  title: "◆STEP 1: 掲示板作成◆",
  isOwnerStep: true,
  fields: [
    COMMON_FIELDS.url,
    COMMON_FIELDS.token,
    {
      name: "title",
      label: "タイトル（オプション）",
      type: "text",
      placeholder: "掲示板のタイトル",
      width: "60%",
    },
    {
      name: "maxMessages",
      label: "最大メッセージ数（オプション）",
      type: "number",
      placeholder: "100",
      width: "30%",
    },
    {
      name: "messagesPerPage",
      label: "1ページあたり件数（オプション）",
      type: "number",
      placeholder: "20",
      width: "30%",
    },
    COMMON_FIELDS.webhookUrl,
  ],
  buttonText: "作成",
  handlerKey: "handleCreate",
  responseKey: "createResponse",
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    let apiUrl = `${API_BASE}${ENDPOINT}?action=create&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (values.title) apiUrl += `&title=${encodeURIComponent(values.title)}`;
    if (values.maxMessages) apiUrl += `&maxMessages=${values.maxMessages}`;
    if (values.messagesPerPage) apiUrl += `&messagesPerPage=${values.messagesPerPage}`;
    if (values.webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(values.webhookUrl)}`;
    return apiUrl;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=create&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
      {values.title && (
        <>
          &title=<GreenParam>{values.title}</GreenParam>
        </>
      )}
      {values.maxMessages && (
        <>
          &maxMessages=<GreenParam>{values.maxMessages}</GreenParam>
        </>
      )}
      {values.messagesPerPage && (
        <>
          &messagesPerPage=<GreenParam>{values.messagesPerPage}</GreenParam>
        </>
      )}
      {values.webhookUrl && (
        <>
          &webhookUrl=<GreenParam>{encodeURIComponent(values.webhookUrl)}</GreenParam>
        </>
      )}
    </>
  ),
};

// Post step
const postStep: StepConfig = {
  id: "post",
  title: "◆ メッセージ投稿 ◆",
  fields: [
    { ...COMMON_FIELDS.publicId, required: true },
    {
      name: "postAuthor",
      label: "投稿者名",
      type: "text",
      placeholder: "投稿者名を入力",
    },
    {
      name: "postMessage",
      label: "メッセージ",
      type: "text",
      placeholder: "メッセージを入力",
      required: true,
    },
    {
      name: "standardValue",
      label: "セレクト1値（任意）",
      type: "text",
      placeholder: "セレクト1値",
    },
    {
      name: "incrementalValue",
      label: "セレクト2値（任意）",
      type: "text",
      placeholder: "セレクト2値",
    },
    {
      name: "emoteValue",
      label: "アイコン値（任意）",
      type: "text",
      placeholder: "アイコン値",
    },
  ],
  buttonText: "投稿",
  handlerKey: "handlePost",
  responseKey: "postResponse",
  buildApiUrl: (values) => {
    const id = values.publicId || "公開ID";
    const author = values.postAuthor || "投稿者名";
    const message = values.postMessage || "メッセージ";
    let apiUrl = `${API_BASE}${ENDPOINT}?action=post&id=${encodeURIComponent(id)}&author=${encodeURIComponent(author)}&message=${encodeURIComponent(message)}`;
    if (values.standardValue)
      apiUrl += `&standardValue=${encodeURIComponent(values.standardValue)}`;
    if (values.incrementalValue)
      apiUrl += `&incrementalValue=${encodeURIComponent(values.incrementalValue)}`;
    if (values.emoteValue) apiUrl += `&emoteValue=${encodeURIComponent(values.emoteValue)}`;
    return apiUrl;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=post&id=
      <GreenParam>{values.publicId || "公開ID"}</GreenParam>
      &author=<GreenParam>{values.postAuthor || "投稿者名"}</GreenParam>
      &message=<GreenParam>{values.postMessage || "メッセージ"}</GreenParam>
      {values.standardValue && (
        <>
          &standardValue=<GreenParam>{values.standardValue}</GreenParam>
        </>
      )}
      {values.incrementalValue && (
        <>
          &incrementalValue=<GreenParam>{values.incrementalValue}</GreenParam>
        </>
      )}
      {values.emoteValue && (
        <>
          &emoteValue=<GreenParam>{values.emoteValue}</GreenParam>
        </>
      )}
    </>
  ),
};

// Get step
const getStep: StepConfig = {
  id: "get",
  title: "◆ BBS取得 ◆",
  fields: [{ ...COMMON_FIELDS.publicId }],
  buttonText: "取得",
  handlerKey: "handleGet",
  responseKey: "getResponse",
  buildApiUrl: (values) => {
    const id = values.publicId || "公開ID";
    return `${API_BASE}${ENDPOINT}?action=get&id=${encodeURIComponent(id)}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=get&id=
      <GreenParam>{values.publicId || "公開ID"}</GreenParam>
    </>
  ),
};

// Confirm Public ID step
const confirmIdStep: StepConfig = {
  id: "confirmId",
  title: "◆公開IDを再確認したいときは？◆",
  isOwnerStep: true,
  fields: [COMMON_FIELDS.url, COMMON_FIELDS.token],
  buttonText: "公開ID確認",
  handlerKey: "handleLookup",
  responseKey: "lookupResponse",
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    return `${API_BASE}${ENDPOINT}?action=lookup&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=lookup&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
    </>
  ),
};

// Update message step (admin)
const updateAdminStep: StepConfig = {
  id: "updateAdmin",
  title: "◆ メッセージ編集（管理者） ◆",
  isOwnerStep: true,
  fields: [
    COMMON_FIELDS.url,
    COMMON_FIELDS.token,
    {
      name: "messageId",
      label: "メッセージID",
      type: "text",
      placeholder: "編集対象メッセージID",
      required: true,
    },
    {
      name: "editMessage",
      label: "新しいメッセージ",
      type: "text",
      placeholder: "編集後メッセージ",
      required: true,
    },
  ],
  buttonText: "編集",
  handlerKey: "handleUpdate",
  responseKey: "updateResponse",
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    const messageId = values.messageId || "メッセージID";
    const message = values.editMessage || "新しいメッセージ";
    return `${API_BASE}${ENDPOINT}?action=update&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}&messageId=${messageId}&message=${encodeURIComponent(message)}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=update&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
      &messageId=<GreenParam>{values.messageId || "メッセージID"}</GreenParam>
      &message=<GreenParam>{values.editMessage || "新しいメッセージ"}</GreenParam>
    </>
  ),
};

// Remove message step (admin)
const removeAdminStep: StepConfig = {
  id: "removeAdmin",
  title: "◆ メッセージ削除（管理者） ◆",
  isOwnerStep: true,
  fields: [
    COMMON_FIELDS.url,
    COMMON_FIELDS.token,
    {
      name: "messageId",
      label: "メッセージID",
      type: "text",
      placeholder: "削除対象メッセージID",
      required: true,
    },
  ],
  buttonText: "削除",
  handlerKey: "handleRemove",
  responseKey: "removeResponse",
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    const messageId = values.messageId || "メッセージID";
    return `${API_BASE}${ENDPOINT}?action=remove&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}&messageId=${messageId}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=remove&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
      &messageId=<GreenParam>{values.messageId || "メッセージID"}</GreenParam>
    </>
  ),
};

// Update message step (author)
const updateAuthorStep: StepConfig = {
  id: "updateAuthor",
  title: "◆ メッセージ編集（投稿者） ◆",
  fields: [
    { ...COMMON_FIELDS.publicId, required: true },
    {
      name: "messageId",
      label: "メッセージID",
      type: "text",
      placeholder: "編集対象メッセージID",
      required: true,
    },
    {
      name: "editMessage",
      label: "新しいメッセージ",
      type: "text",
      placeholder: "編集後メッセージ",
      required: true,
    },
  ],
  buttonText: "編集",
  handlerKey: "handleEditMessageById",
  responseKey: "updateAuthorResponse",
  buildApiUrl: (values) => {
    const id = values.publicId || "公開ID";
    const messageId = values.messageId || "メッセージID";
    const message = values.editMessage || "新しいメッセージ";
    return `${API_BASE}${ENDPOINT}?action=update&id=${encodeURIComponent(id)}&messageId=${messageId}&message=${encodeURIComponent(message)}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=update&id=
      <GreenParam>{values.publicId || "公開ID"}</GreenParam>
      &messageId=<GreenParam>{values.messageId || "メッセージID"}</GreenParam>
      &message=<GreenParam>{values.editMessage || "新しいメッセージ"}</GreenParam>
    </>
  ),
};

// Remove message step (author)
const removeAuthorStep: StepConfig = {
  id: "removeAuthor",
  title: "◆ メッセージ削除（投稿者） ◆",
  fields: [
    { ...COMMON_FIELDS.publicId, required: true },
    {
      name: "messageId",
      label: "メッセージID",
      type: "text",
      placeholder: "削除対象メッセージID",
      required: true,
    },
  ],
  buttonText: "削除",
  handlerKey: "handleDeleteMessageById",
  responseKey: "removeAuthorResponse",
  buildApiUrl: (values) => {
    const id = values.publicId || "公開ID";
    const messageId = values.messageId || "メッセージID";
    return `${API_BASE}${ENDPOINT}?action=remove&id=${encodeURIComponent(id)}&messageId=${messageId}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=remove&id=
      <GreenParam>{values.publicId || "公開ID"}</GreenParam>
      &messageId=<GreenParam>{values.messageId || "メッセージID"}</GreenParam>
    </>
  ),
};

// Clear step
const clearStep: StepConfig = {
  id: "clear",
  title: "◆ 全メッセージ削除 ◆",
  isOwnerStep: true,
  fields: [COMMON_FIELDS.url, COMMON_FIELDS.token],
  buttonText: "全削除",
  buttonVariant: "danger",
  handlerKey: "handleClear",
  responseKey: "clearResponse",
  warningMessage: (
    <p style={{ color: "#ff0000", fontWeight: "bold" }}>
      ※全てのメッセージを削除します。元に戻せません。
    </p>
  ),
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    return `${API_BASE}${ENDPOINT}?action=clear&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=clear&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
    </>
  ),
};

// Update Settings step
const updateSettingsStep: StepConfig = {
  id: "updateSettings",
  title: "◆ 設定更新 ◆",
  isOwnerStep: true,
  description: "掲示板の設定を更新します。",
  fields: [
    COMMON_FIELDS.url,
    COMMON_FIELDS.token,
    {
      name: "settingsTitle",
      label: "タイトル",
      type: "text",
      placeholder: "BBS",
    },
    {
      name: "settingsMaxMessages",
      label: "最大メッセージ数",
      type: "number",
      placeholder: "100",
      width: "30%",
    },
    {
      name: "settingsMessagesPerPage",
      label: "1ページあたり件数",
      type: "number",
      placeholder: "20",
      width: "30%",
    },
    {
      name: "settingsWebhookUrl",
      label: "Webhook URL",
      type: "url",
      placeholder: "https://hooks.slack.com/...",
    },
    {
      name: "standardSelectLabel",
      label: "セレクト1ラベル",
      type: "text",
      placeholder: "カテゴリ",
    },
    {
      name: "standardSelectOptions",
      label: "セレクト1選択肢",
      type: "text",
      placeholder: "質問,雑談,報告（カンマ区切り）",
    },
    {
      name: "incrementalSelectLabel",
      label: "セレクト2ラベル",
      type: "text",
      placeholder: "優先度",
    },
    {
      name: "incrementalSelectOptions",
      label: "セレクト2選択肢",
      type: "text",
      placeholder: "低,中,高（カンマ区切り）",
    },
    {
      name: "emoteSelectLabel",
      label: "アイコンラベル",
      type: "text",
      placeholder: "気分",
    },
    {
      name: "emoteSelectOptions",
      label: "アイコン選択肢",
      type: "text",
      placeholder: "😊,😢,😡（カンマ区切り）",
    },
  ],
  buttonText: "更新",
  handlerKey: "handleUpdateSettings",
  responseKey: "updateSettingsResponse",
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    let apiUrl = `${API_BASE}${ENDPOINT}?action=update&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (values.settingsTitle) apiUrl += `&title=${encodeURIComponent(values.settingsTitle)}`;
    if (values.settingsMaxMessages) apiUrl += `&maxMessages=${values.settingsMaxMessages}`;
    if (values.settingsMessagesPerPage)
      apiUrl += `&messagesPerPage=${values.settingsMessagesPerPage}`;
    if (values.settingsWebhookUrl)
      apiUrl += `&webhookUrl=${encodeURIComponent(values.settingsWebhookUrl)}`;
    if (values.standardSelectLabel) {
      apiUrl += `&standardSelectLabel=${encodeURIComponent(values.standardSelectLabel)}&standardSelectOptions=${encodeURIComponent(values.standardSelectOptions || "")}`;
    }
    if (values.incrementalSelectLabel) {
      apiUrl += `&incrementalSelectLabel=${encodeURIComponent(values.incrementalSelectLabel)}&incrementalSelectOptions=${encodeURIComponent(values.incrementalSelectOptions || "")}`;
    }
    if (values.emoteSelectLabel) {
      apiUrl += `&emoteSelectLabel=${encodeURIComponent(values.emoteSelectLabel)}&emoteSelectOptions=${encodeURIComponent(values.emoteSelectOptions || "")}`;
    }
    return apiUrl;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=update&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
      {values.settingsTitle && (
        <>
          &title=<GreenParam>{values.settingsTitle}</GreenParam>
        </>
      )}
      {values.settingsMaxMessages && (
        <>
          &maxMessages=<GreenParam>{values.settingsMaxMessages}</GreenParam>
        </>
      )}
      {values.settingsMessagesPerPage && (
        <>
          &messagesPerPage=<GreenParam>{values.settingsMessagesPerPage}</GreenParam>
        </>
      )}
      {values.settingsWebhookUrl && (
        <>
          &webhookUrl=<GreenParam>{values.settingsWebhookUrl}</GreenParam>
        </>
      )}
      {values.standardSelectLabel && (
        <>
          &standardSelectLabel=<GreenParam>{values.standardSelectLabel}</GreenParam>
          &standardSelectOptions=<GreenParam>{values.standardSelectOptions}</GreenParam>
        </>
      )}
      {values.incrementalSelectLabel && (
        <>
          &incrementalSelectLabel=<GreenParam>{values.incrementalSelectLabel}</GreenParam>
          &incrementalSelectOptions=<GreenParam>{values.incrementalSelectOptions}</GreenParam>
        </>
      )}
      {values.emoteSelectLabel && (
        <>
          &emoteSelectLabel=<GreenParam>{values.emoteSelectLabel}</GreenParam>
          &emoteSelectOptions=<GreenParam>{values.emoteSelectOptions}</GreenParam>
        </>
      )}
    </>
  ),
};

// Delete step
const deleteStep: StepConfig = {
  id: "delete",
  title: "◆ BBS削除 ◆",
  isOwnerStep: true,
  fields: [COMMON_FIELDS.url, COMMON_FIELDS.token],
  buttonText: "削除",
  buttonVariant: "danger",
  handlerKey: "handleDelete",
  responseKey: "deleteResponse",
  warningMessage: (
    <p style={{ color: "#ff0000", fontWeight: "bold" }}>
      ※削除すると復元できません。十分にご注意ください。
    </p>
  ),
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    return `${API_BASE}${ENDPOINT}?action=delete&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=delete&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
    </>
  ),
};

export const bbsSteps: StepConfig[] = [
  createStep,
  postStep,
  getStep,
  confirmIdStep,
  updateAdminStep,
  removeAdminStep,
  updateAuthorStep,
  removeAuthorStep,
  clearStep,
  updateSettingsStep,
  deleteStep,
];
