import { GreenParam } from "../../components/ApiUrlDisplay";
import { API_BASE, COMMON_FIELDS, type StepConfig } from "../commonSteps";

const ENDPOINT = "/api/like";

// Like-specific format options (no image theme)
const likeFormatField = {
  name: "format",
  label: "形式",
  type: "select" as const,
  width: "30%",
  options: [
    { value: "json", label: "JSON" },
    { value: "text", label: "テキスト" },
    { value: "image", label: "画像" },
  ],
};

// Create step (STEP 1)
const createStep: StepConfig = {
  id: "create",
  title: "◆STEP 1: いいね作成◆",
  isOwnerStep: true,
  fields: [COMMON_FIELDS.url, COMMON_FIELDS.token, COMMON_FIELDS.webhookUrl],
  buttonText: "作成",
  handlerKey: "handleCreate",
  responseKey: "createResponse",
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    const webhookUrl = values.webhookUrl;
    let apiUrl = `${API_BASE}${ENDPOINT}?action=create&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;
    return apiUrl;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=create&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
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
  title: "◆STEP 2: いいね表示◆",
  fields: [{ ...COMMON_FIELDS.publicId }, likeFormatField],
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

// Confirm Public ID step
const confirmIdStep: StepConfig = {
  id: "confirmId",
  title: "◆公開IDを再確認したいときは？◆",
  isOwnerStep: true,
  fields: [COMMON_FIELDS.url, COMMON_FIELDS.token],
  buttonText: "公開ID確認",
  handlerKey: "handleCreate",
  responseKey: "createResponse",
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    const webhookUrl = values.webhookUrl;
    let apiUrl = `${API_BASE}${ENDPOINT}?action=create&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;
    return apiUrl;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=create&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
      {values.webhookUrl && (
        <>
          &webhookUrl=<GreenParam>{encodeURIComponent(values.webhookUrl)}</GreenParam>
        </>
      )}
    </>
  ),
};

// Toggle step
const toggleStep: StepConfig = {
  id: "toggle",
  title: "◆いいねをトグルしたいときは？◆",
  fields: [{ ...COMMON_FIELDS.publicId, required: true }],
  buttonText: "いいねトグル",
  handlerKey: "handleToggle",
  responseKey: "toggleResponse",
  buildApiUrl: (values) => {
    const id = values.publicId || "公開ID";
    return `${API_BASE}${ENDPOINT}?action=toggle&id=${encodeURIComponent(id)}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=toggle&id=
      <GreenParam>{values.publicId || "公開ID"}</GreenParam>
    </>
  ),
};

// Get step
const getStep: StepConfig = {
  id: "get",
  title: "◆いいねデータを取得したいときは？◆",
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

// Update Settings step
const updateSettingsStep: StepConfig = {
  id: "updateSettings",
  title: "◆設定更新◆",
  isOwnerStep: true,
  description: "いいねボタンの設定を更新します。",
  fields: [
    COMMON_FIELDS.url,
    COMMON_FIELDS.token,
    {
      name: "webhookUrl",
      label: "Webhook URL",
      type: "url",
      placeholder: "https://example.com/webhook",
    },
  ],
  buttonText: "設定更新",
  handlerKey: "handleUpdateSettings",
  responseKey: "updateSettingsResponse",
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    const webhookUrl = values.webhookUrl;
    let apiUrl = `${API_BASE}${ENDPOINT}?action=update&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (webhookUrl) apiUrl += `&webhookUrl=${encodeURIComponent(webhookUrl)}`;
    return apiUrl;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=update&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
      {values.webhookUrl && (
        <>
          &webhookUrl=<GreenParam>{values.webhookUrl}</GreenParam>
        </>
      )}
    </>
  ),
};

// Delete step
const deleteStep: StepConfig = {
  id: "delete",
  title: "◆いいねを削除したいときは？◆",
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

export const likeSteps: StepConfig[] = [
  createStep,
  displayStep,
  confirmIdStep,
  toggleStep,
  getStep,
  updateSettingsStep,
  deleteStep,
];
