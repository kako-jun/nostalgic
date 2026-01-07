import { GreenParam } from "../components/ApiUrlDisplay";

export const getLikeFormSections = (
  sharedUrl: string,
  setSharedUrl: (v: string) => void,
  sharedToken: string,
  setSharedToken: (v: string) => void,
  publicId: string,
  setPublicId: (v: string) => void,
  webhookUrl: string,
  setWebhookUrl: (v: string) => void,
  selectedFormat: string,
  setSelectedFormat: (v: string) => void,
  handlers: {
    handleCreate: (e: React.FormEvent) => void;
    handleDisplay: (e: React.FormEvent) => void;
    handleToggle: (e: React.FormEvent) => void;
    handleGet: (e: React.FormEvent) => void;
    handleUpdateSettings: (e: React.FormEvent) => void;
    handleDelete: (e: React.FormEvent) => void;
  },
  responses: {
    createResponse: string;
    displayResponse: string;
    toggleResponse: string;
    getResponse: string;
    updateSettingsResponse: string;
    deleteResponse: string;
  },
  responseType: "json" | "text" | "svg"
) => [
  // STEP 2: Display
  {
    title: "◆STEP 2: いいね表示◆",
    apiUrl: `https://api.nostalgic.llll-ll.com/like?action=get&id=${encodeURIComponent(publicId || "公開ID")}&format=${selectedFormat}`,
    apiUrlDisplay: (
      <>
        https://api.nostalgic.llll-ll.com/like?action=get&id=
        <GreenParam>{publicId || "公開ID"}</GreenParam>
        &format=<GreenParam>{selectedFormat}</GreenParam>
      </>
    ),
    fields: [
      {
        name: "publicId",
        label: "公開ID",
        type: "text" as const,
        placeholder: "STEP 1で作成後に表示されます",
        width: "40%",
        value: publicId,
        onChange: setPublicId,
      },
      {
        name: "format",
        label: "形式",
        type: "select" as const,
        width: "30%",
        value: selectedFormat,
        onChange: setSelectedFormat,
        options: [
          { value: "json", label: "JSON" },
          { value: "text", label: "テキスト" },
          { value: "svg", label: "SVG画像" },
        ],
      },
    ],
    buttonText: "表示データ取得",
    onSubmit: handlers.handleDisplay,
    response: responses.displayResponse,
    responseType,
  },
  // Toggle
  {
    title: "◆公開IDを再確認したいときは？◆",
    apiUrl: `https://api.nostalgic.llll-ll.com/like?action=create&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`,
    apiUrlDisplay: (
      <>
        https://api.nostalgic.llll-ll.com/like?action=create&url=
        <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
        &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
        {webhookUrl && (
          <>
            &webhookUrl=<GreenParam>{encodeURIComponent(webhookUrl)}</GreenParam>
          </>
        )}
      </>
    ),
    fields: [
      {
        name: "url",
        label: "サイトURL",
        type: "url" as const,
        placeholder: "https://example.com",
        required: true,
        value: sharedUrl,
        onChange: setSharedUrl,
      },
      {
        name: "token",
        label: "オーナートークン",
        type: "text" as const,
        placeholder: "8-16文字",
        required: true,
        width: "30%",
        value: sharedToken,
        onChange: setSharedToken,
      },
    ],
    buttonText: "公開ID確認",
    onSubmit: handlers.handleCreate,
    response: responses.createResponse,
  },
  // Toggle Like
  {
    title: "◆いいねをトグルしたいときは？◆",
    apiUrl: `https://api.nostalgic.llll-ll.com/like?action=toggle&id=${encodeURIComponent(publicId || "公開ID")}`,
    apiUrlDisplay: (
      <>
        https://api.nostalgic.llll-ll.com/like?action=toggle&id=
        <GreenParam>{publicId || "公開ID"}</GreenParam>
      </>
    ),
    fields: [
      {
        name: "publicId",
        label: "公開ID",
        type: "text" as const,
        placeholder: "STEP 1で作成後に表示されます",
        width: "40%",
        required: true,
        value: publicId,
        onChange: setPublicId,
      },
    ],
    buttonText: "いいねトグル",
    onSubmit: handlers.handleToggle,
    response: responses.toggleResponse,
  },
  // Get Like Data
  {
    title: "◆いいねデータを取得したいときは？◆",
    apiUrl: `https://api.nostalgic.llll-ll.com/like?action=get&id=${encodeURIComponent(publicId || "公開ID")}`,
    apiUrlDisplay: (
      <>
        https://api.nostalgic.llll-ll.com/like?action=get&id=
        <GreenParam>{publicId || "公開ID"}</GreenParam>
      </>
    ),
    fields: [
      {
        name: "publicId",
        label: "公開ID",
        type: "text" as const,
        placeholder: "STEP 1で作成後に表示されます",
        width: "40%",
        value: publicId,
        onChange: setPublicId,
      },
    ],
    buttonText: "データ取得",
    onSubmit: handlers.handleGet,
    response: responses.getResponse,
  },
  // Update Settings
  {
    title: "◆設定更新◆",
    description: "いいねボタンの設定を更新します。",
    apiUrl: `https://api.nostalgic.llll-ll.com/like?action=update&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`,
    apiUrlDisplay: (
      <>
        https://api.nostalgic.llll-ll.com/like?action=update&url=
        <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
        &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
        {webhookUrl && (
          <>
            &webhookUrl=<GreenParam>{webhookUrl}</GreenParam>
          </>
        )}
      </>
    ),
    fields: [
      {
        name: "url",
        label: "サイトURL",
        type: "url" as const,
        placeholder: "https://example.com",
        required: true,
        value: sharedUrl,
        onChange: setSharedUrl,
      },
      {
        name: "token",
        label: "オーナートークン",
        type: "text" as const,
        placeholder: "8-16文字",
        required: true,
        width: "30%",
        value: sharedToken,
        onChange: setSharedToken,
      },
      {
        name: "webhook",
        label: "Webhook URL",
        type: "url" as const,
        placeholder: "https://example.com/webhook",
        value: webhookUrl,
        onChange: setWebhookUrl,
      },
    ],
    buttonText: "設定更新",
    onSubmit: handlers.handleUpdateSettings,
    response: responses.updateSettingsResponse,
  },
  // Delete
  {
    title: "◆いいねを削除したいときは？◆",
    apiUrl: `https://api.nostalgic.llll-ll.com/like?action=delete&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`,
    apiUrlDisplay: (
      <>
        https://api.nostalgic.llll-ll.com/like?action=delete&url=
        <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
        &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
      </>
    ),
    fields: [
      {
        name: "url",
        label: "サイトURL",
        type: "url" as const,
        placeholder: "https://example.com",
        required: true,
        value: sharedUrl,
        onChange: setSharedUrl,
      },
      {
        name: "token",
        label: "オーナートークン",
        type: "text" as const,
        placeholder: "8-16文字",
        required: true,
        width: "30%",
        value: sharedToken,
        onChange: setSharedToken,
      },
    ],
    buttonText: "削除",
    buttonVariant: "danger" as const,
    onSubmit: handlers.handleDelete,
    response: responses.deleteResponse,
    warningMessage: (
      <p style={{ color: "#ff0000", fontWeight: "bold" }}>
        ※削除すると復元できません。十分にご注意ください。
      </p>
    ),
  },
];
