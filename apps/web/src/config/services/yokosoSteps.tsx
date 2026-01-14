import { GreenParam } from "../../components/ApiUrlDisplay";
import { API_BASE, COMMON_FIELDS, type StepConfig } from "../commonSteps";

const ENDPOINT = "/api/yokoso";

// Yokoso-specific fields
const modeField = {
  name: "mode",
  label: "モード",
  type: "select" as const,
  width: "30%",
  options: [
    { value: "badge", label: "バッジ（20文字）" },
    { value: "card", label: "カード（140文字）" },
  ],
};

const messageField = {
  name: "message",
  label: "メッセージ",
  type: "text" as const,
  placeholder: "ようこそ！",
  required: true,
};

const nameField = {
  name: "name",
  label: "名前（カード用）",
  type: "text" as const,
  placeholder: "Maneki（デフォルト）",
};

const avatarField = {
  name: "avatar",
  label: "アバターURL（カード用）",
  type: "url" as const,
  placeholder: "https://example.com/avatar.png（未指定で招き猫）",
};

// Create step (STEP 1)
const createStep: StepConfig = {
  id: "create",
  title: "◆STEP 1: Yokoso作成◆",
  isOwnerStep: true,
  fields: [
    COMMON_FIELDS.url,
    COMMON_FIELDS.token,
    messageField,
    modeField,
    nameField,
    avatarField,
    COMMON_FIELDS.webhookUrl,
  ],
  buttonText: "作成",
  handlerKey: "handleCreate",
  responseKey: "createResponse",
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    const message = values.message || "メッセージ";
    const mode = values.mode || "badge";
    let apiUrl = `${API_BASE}${ENDPOINT}?action=create&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}&message=${encodeURIComponent(message)}&mode=${mode}`;
    if (values.name) apiUrl += `&name=${encodeURIComponent(values.name)}`;
    if (values.avatar) apiUrl += `&avatar=${encodeURIComponent(values.avatar)}`;
    if (values.webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(values.webhookUrl)}`;
    return apiUrl;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=create&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
      &message=<GreenParam>{values.message || "メッセージ"}</GreenParam>
      &mode=<GreenParam>{values.mode || "badge"}</GreenParam>
      {values.name && (
        <>
          &name=<GreenParam>{values.name}</GreenParam>
        </>
      )}
      {values.avatar && (
        <>
          &avatar=<GreenParam>{encodeURIComponent(values.avatar)}</GreenParam>
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

// Display step (STEP 2)
const displayStep: StepConfig = {
  id: "display",
  title: "◆STEP 2: Yokoso表示◆",
  fields: [{ ...COMMON_FIELDS.publicId }, COMMON_FIELDS.format],
  buttonText: "表示データ取得",
  handlerKey: "handleDisplay",
  responseKey: "displayResponse",
  buildApiUrl: (values) => {
    const id = values.publicId || "公開ID";
    const format = values.format || "json";
    return `${API_BASE}${ENDPOINT}?action=get&id=${encodeURIComponent(id)}&format=${format}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=get&id=
      <GreenParam>{values.publicId || "公開ID"}</GreenParam>
      &format=<GreenParam>{values.format || "json"}</GreenParam>
    </>
  ),
};

// Update Message step
const updateMessageStep: StepConfig = {
  id: "updateMessage",
  title: "◆メッセージを更新したいときは？◆",
  isOwnerStep: true,
  description: "招き猫のメッセージを更新します。",
  fields: [
    COMMON_FIELDS.url,
    COMMON_FIELDS.token,
    { ...messageField, required: false },
    modeField,
    nameField,
    avatarField,
  ],
  buttonText: "メッセージ更新",
  handlerKey: "handleUpdate",
  responseKey: "updateResponse",
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    let apiUrl = `${API_BASE}${ENDPOINT}?action=update&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (values.message) apiUrl += `&message=${encodeURIComponent(values.message)}`;
    if (values.mode) apiUrl += `&mode=${values.mode}`;
    if (values.name) apiUrl += `&name=${encodeURIComponent(values.name)}`;
    if (values.avatar) apiUrl += `&avatar=${encodeURIComponent(values.avatar)}`;
    return apiUrl;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=update&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
      {values.message && (
        <>
          &message=<GreenParam>{values.message}</GreenParam>
        </>
      )}
      {values.mode && (
        <>
          &mode=<GreenParam>{values.mode}</GreenParam>
        </>
      )}
      {values.name && (
        <>
          &name=<GreenParam>{values.name}</GreenParam>
        </>
      )}
      {values.avatar && (
        <>
          &avatar=<GreenParam>{encodeURIComponent(values.avatar)}</GreenParam>
        </>
      )}
    </>
  ),
};

// Get step
const getStep: StepConfig = {
  id: "get",
  title: "◆データを取得したいときは？◆",
  fields: [{ ...COMMON_FIELDS.publicId }],
  buttonText: "データ取得",
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

// Delete step
const deleteStep: StepConfig = {
  id: "delete",
  title: "◆Yokosoを削除したいときは？◆",
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

export const yokosoSteps: StepConfig[] = [
  createStep,
  displayStep,
  updateMessageStep,
  getStep,
  deleteStep,
];
