import { GreenParam } from "../../components/ApiUrlDisplay";
import { API_BASE, COMMON_FIELDS, type StepConfig } from "../commonSteps";

const ENDPOINT = "/api/ranking";

// Create step (STEP 1) - with additional fields for ranking
const createStep: StepConfig = {
  id: "create",
  title: "◆STEP 1: ランキング作成◆",
  isOwnerStep: true,
  fields: [
    COMMON_FIELDS.url,
    COMMON_FIELDS.token,
    {
      name: "title",
      label: "タイトル（オプション）",
      type: "text",
      placeholder: "ランキングのタイトル",
      width: "60%",
    },
    {
      name: "maxEntries",
      label: "最大エントリー数（オプション）",
      type: "number",
      placeholder: "100",
      width: "30%",
    },
    {
      name: "sortOrder",
      label: "ソート順（オプション）",
      type: "select",
      width: "30%",
      options: [
        { value: "desc", label: "降順（高い順）" },
        { value: "asc", label: "昇順（低い順）" },
      ],
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
    if (values.maxEntries) apiUrl += `&maxEntries=${values.maxEntries}`;
    if (values.sortOrder) apiUrl += `&sortOrder=${values.sortOrder}`;
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
      {values.maxEntries && (
        <>
          &maxEntries=<GreenParam>{values.maxEntries}</GreenParam>
        </>
      )}
      {values.sortOrder && (
        <>
          &sortOrder=<GreenParam>{values.sortOrder}</GreenParam>
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

// Submit step (STEP 2)
const submitStep: StepConfig = {
  id: "submit",
  title: "◆STEP 2: スコア登録◆",
  fields: [
    { ...COMMON_FIELDS.publicId, required: true },
    {
      name: "submitName",
      label: "名前",
      type: "text",
      placeholder: "プレイヤー名",
      width: "40%",
      required: true,
    },
    {
      name: "submitScore",
      label: "スコア",
      type: "number",
      placeholder: "0",
      width: "30%",
      required: true,
    },
    {
      name: "submitDisplayScore",
      label: "表示スコア",
      type: "text",
      placeholder: "123,456点",
      width: "40%",
    },
  ],
  buttonText: "スコア登録",
  handlerKey: "handleSubmit",
  responseKey: "submitResponse",
  buildApiUrl: (values) => {
    const id = values.publicId || "公開ID";
    const name = values.submitName || "名前";
    const score = values.submitScore || "スコア";
    let apiUrl = `${API_BASE}${ENDPOINT}?action=submit&id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&score=${score}`;
    if (values.submitDisplayScore)
      apiUrl += `&displayScore=${encodeURIComponent(values.submitDisplayScore)}`;
    return apiUrl;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=submit&id=
      <GreenParam>{values.publicId || "公開ID"}</GreenParam>
      &name=<GreenParam>{values.submitName || "名前"}</GreenParam>
      &score=<GreenParam>{values.submitScore || "スコア"}</GreenParam>
      {values.submitDisplayScore && (
        <>
          &displayScore=<GreenParam>{values.submitDisplayScore}</GreenParam>
        </>
      )}
    </>
  ),
};

// Get step
const getStep: StepConfig = {
  id: "get",
  title: "◆ランキングデータを取得したいときは？◆",
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
    return `${API_BASE}${ENDPOINT}?action=create&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=create&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
    </>
  ),
};

// Update step (UPSERT via submit)
const updateStep: StepConfig = {
  id: "update",
  title: "◆スコアを更新したいときは？◆",
  description: "既存エントリがあれば更新、なければ新規追加（UPSERT）",
  fields: [
    { ...COMMON_FIELDS.publicId, required: true },
    {
      name: "updateName",
      label: "名前",
      type: "text",
      placeholder: "プレイヤー名",
      width: "40%",
      required: true,
    },
    {
      name: "updateScore",
      label: "スコア",
      type: "number",
      placeholder: "0",
      width: "30%",
      required: true,
    },
    {
      name: "updateDisplayScore",
      label: "表示スコア",
      type: "text",
      placeholder: "123,456点",
      width: "40%",
    },
  ],
  buttonText: "スコア更新",
  handlerKey: "handleUpdate",
  responseKey: "updateResponse",
  buildApiUrl: (values) => {
    const id = values.publicId || "公開ID";
    const name = values.updateName || "名前";
    const score = values.updateScore || "スコア";
    let apiUrl = `${API_BASE}${ENDPOINT}?action=submit&id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&score=${score}`;
    if (values.updateDisplayScore)
      apiUrl += `&displayScore=${encodeURIComponent(values.updateDisplayScore)}`;
    return apiUrl;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=submit&id=
      <GreenParam>{values.publicId || "公開ID"}</GreenParam>
      &name=<GreenParam>{values.updateName || "名前"}</GreenParam>
      &score=<GreenParam>{values.updateScore || "スコア"}</GreenParam>
      {values.updateDisplayScore && (
        <>
          &displayScore=<GreenParam>{values.updateDisplayScore}</GreenParam>
        </>
      )}
    </>
  ),
};

// Remove entry step
const removeStep: StepConfig = {
  id: "remove",
  title: "◆エントリを削除したいときは？◆",
  isOwnerStep: true,
  fields: [
    COMMON_FIELDS.url,
    COMMON_FIELDS.token,
    {
      name: "removeName",
      label: "名前",
      type: "text",
      placeholder: "削除する名前",
      width: "40%",
      required: true,
    },
  ],
  buttonText: "エントリ削除",
  handlerKey: "handleRemove",
  responseKey: "removeResponse",
  buildApiUrl: (values) => {
    const url = values.url || "サイトURL";
    const token = values.token || "オーナートークン";
    const name = values.removeName || "名前";
    return `${API_BASE}${ENDPOINT}?action=remove&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}&name=${encodeURIComponent(name)}`;
  },
  buildApiUrlDisplay: (values) => (
    <>
      {API_BASE}
      {ENDPOINT}?action=remove&url=
      <GreenParam>{values.url || "サイトURL"}</GreenParam>
      &token=<GreenParam>{values.token || "オーナートークン"}</GreenParam>
      &name=<GreenParam>{values.removeName || "名前"}</GreenParam>
    </>
  ),
};

// Clear step
const clearStep: StepConfig = {
  id: "clear",
  title: "◆全エントリをクリアしたいときは？◆",
  isOwnerStep: true,
  fields: [COMMON_FIELDS.url, COMMON_FIELDS.token],
  buttonText: "全エントリクリア",
  buttonVariant: "danger",
  handlerKey: "handleClear",
  responseKey: "clearResponse",
  warningMessage: (
    <p style={{ color: "#ff0000", fontWeight: "bold" }}>
      ※全てのランキングデータをクリアします。元に戻せません。
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
  title: "◆設定更新◆",
  isOwnerStep: true,
  description: "ランキングの設定を更新します。",
  fields: [
    COMMON_FIELDS.url,
    COMMON_FIELDS.token,
    {
      name: "settingsTitle",
      label: "タイトル",
      type: "text",
      placeholder: "ハイスコアランキング",
      width: "60%",
    },
    {
      name: "settingsMax",
      label: "最大表示数",
      type: "number",
      placeholder: "10",
      width: "30%",
    },
    {
      name: "settingsSortOrder",
      label: "ソート順",
      type: "select",
      width: "30%",
      options: [
        { value: "", label: "未設定" },
        { value: "desc", label: "降順（高い順）" },
        { value: "asc", label: "昇順（低い順）" },
      ],
    },
    {
      name: "settingsWebhookUrl",
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
    let apiUrl = `${API_BASE}${ENDPOINT}?action=update&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    if (values.settingsTitle) apiUrl += `&title=${encodeURIComponent(values.settingsTitle)}`;
    if (values.settingsMax) apiUrl += `&maxEntries=${values.settingsMax}`;
    if (values.settingsSortOrder) apiUrl += `&sortOrder=${values.settingsSortOrder}`;
    if (values.settingsWebhookUrl)
      apiUrl += `&webhookUrl=${encodeURIComponent(values.settingsWebhookUrl)}`;
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
      {values.settingsMax && (
        <>
          &maxEntries=<GreenParam>{values.settingsMax}</GreenParam>
        </>
      )}
      {values.settingsSortOrder && (
        <>
          &sortOrder=<GreenParam>{values.settingsSortOrder}</GreenParam>
        </>
      )}
      {values.settingsWebhookUrl && (
        <>
          &webhookUrl=<GreenParam>{values.settingsWebhookUrl}</GreenParam>
        </>
      )}
    </>
  ),
};

// Delete step
const deleteStep: StepConfig = {
  id: "delete",
  title: "◆ランキングを削除したいときは？◆",
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

export const rankingSteps: StepConfig[] = [
  createStep,
  submitStep,
  getStep,
  confirmIdStep,
  updateStep,
  removeStep,
  clearStep,
  updateSettingsStep,
  deleteStep,
];
