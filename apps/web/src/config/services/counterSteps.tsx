import { GreenParam } from "../../components/ApiUrlDisplay";
import { API_BASE, COMMON_FIELDS, type StepConfig } from "../commonSteps";

const ENDPOINT = "/api/visit";

// Create step (STEP 1)
const createStep: StepConfig = {
  id: "create",
  title: "◆STEP 1: カウンター作成◆",
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
  title: "◆STEP 2: 表示プレビュー◆",
  fields: [{ ...COMMON_FIELDS.publicId }, COMMON_FIELDS.format],
  buttonText: "表示データ取得",
  handlerKey: "handleDisplay",
  responseKey: "displayResponse",
  buildApiUrl: (values) => {
    const id = values.publicId || "公開ID";
    const format = values.format || "json";
    return `${API_BASE}${ENDPOINT}?action=get&id=${encodeURIComponent(id)}&type=total&format=${format}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=get&id=
      <GreenParam>{values.publicId || "公開ID"}</GreenParam>
      &type=total&format=<GreenParam>{values.format || "json"}</GreenParam>
    </>
  ),
};

// Confirm Public ID step
const confirmIdStep: StepConfig = {
  id: "confirmId",
  title: "◆公開IDを再確認したいときは？◆",
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

// Increment step
const incrementStep: StepConfig = {
  id: "increment",
  title: "◆カウントを増やしたいときは？◆",
  fields: [{ ...COMMON_FIELDS.publicId, required: true }],
  buttonText: "カウント+1",
  handlerKey: "handleIncrement",
  responseKey: "incrementResponse",
  buildApiUrl: (values) => {
    const id = values.publicId || "公開ID";
    return `${API_BASE}${ENDPOINT}?action=increment&id=${encodeURIComponent(id)}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=increment&id=
      <GreenParam>{values.publicId || "公開ID"}</GreenParam>
    </>
  ),
};

// Get step
const getStep: StepConfig = {
  id: "get",
  title: "◆カウントデータを取得したいときは？◆",
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

// Set step
const setStep: StepConfig = {
  id: "set",
  title: "◆カウント値を設定したいときは？◆",
  fields: [
    COMMON_FIELDS.url,
    COMMON_FIELDS.token,
    {
      name: "setValue",
      label: "設定値",
      type: "number",
      placeholder: "0",
      required: true,
      width: "20%",
    },
  ],
  buttonText: "値を設定",
  buttonVariant: "warning",
  handlerKey: "handleSet",
  responseKey: "setResponse",
  warningMessage: (
    <p style={{ color: "#ff6600", fontWeight: "bold" }}>※カウント値を直接設定します。</p>
  ),
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    const setValue = values.setValue || "0";
    return `${API_BASE}${ENDPOINT}?action=set&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}&value=${setValue}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=set&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
      &value=<GreenParam>{values.setValue || "0"}</GreenParam>
    </>
  ),
};

// Update Settings step
const updateSettingsStep: StepConfig = {
  id: "updateSettings",
  title: "◆設定更新◆",
  description: "カウンターの設定を更新します。",
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
  title: "◆カウンターを削除したいときは？◆",
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

export const counterSteps: StepConfig[] = [
  createStep,
  displayStep,
  confirmIdStep,
  incrementStep,
  getStep,
  setStep,
  updateSettingsStep,
  deleteStep,
];
