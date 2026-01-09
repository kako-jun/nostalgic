import { GreenParam } from "../components/ApiUrlDisplay";

type FieldType = "text" | "url" | "number" | "select";

interface BBSFormSectionConfig {
  title: string;
  apiUrl: string;
  apiUrlDisplay: JSX.Element;
  fields: Array<{
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
  }>;
  buttonText: string;
  onSubmit: (e: React.FormEvent) => void;
  response: string;
}

interface BBSFormParams {
  publicId: string;
  sharedUrl: string;
  sharedToken: string;
  title: string;
  setTitle: (value: string) => void;
  maxMessages: string;
  setMaxMessages: (value: string) => void;
  webhookUrl: string;
  setWebhookUrl: (value: string) => void;
  messagesPerPage: string;
  setMessagesPerPage: (value: string) => void;
  standardSelectLabel: string;
  setStandardSelectLabel: (value: string) => void;
  standardSelectOptions: string;
  setStandardSelectOptions: (value: string) => void;
  incrementalSelectLabel: string;
  setIncrementalSelectLabel: (value: string) => void;
  incrementalSelectOptions: string;
  setIncrementalSelectOptions: (value: string) => void;
  emoteSelectLabel: string;
  setEmoteSelectLabel: (value: string) => void;
  emoteSelectOptions: string;
  setEmoteSelectOptions: (value: string) => void;
  postAuthor: string;
  postMessage: string;
  standardValue: string;
  incrementalValue: string;
  emoteValue: string;
  messageId: string;
  editMessage: string;
  setPostAuthor: (value: string) => void;
  setPostMessage: (value: string) => void;
  setStandardValue: (value: string) => void;
  setIncrementalValue: (value: string) => void;
  setEmoteValue: (value: string) => void;
  setMessageId: (value: string) => void;
  setEditMessage: (value: string) => void;
  handleCreate: (e: React.FormEvent) => void;
  handlePost: (e: React.FormEvent) => void;
  handleGet: (e: React.FormEvent) => void;
  handleUpdate: (e: React.FormEvent) => void;
  handleRemove: (e: React.FormEvent) => void;
  handleClear: (e: React.FormEvent) => void;
  handleDelete: (e: React.FormEvent) => void;
  handleUpdateSettings: (e: React.FormEvent) => void;
  handleEditMessageById: (e: React.FormEvent) => void;
  handleDeleteMessageById: (e: React.FormEvent) => void;
  createResponse: string;
  postResponse: string;
  getResponse: string;
  updateResponse: string;
  removeResponse: string;
  clearResponse: string;
  deleteResponse: string;
  updateSettingsResponse: string;
}

export function getBBSFormSections(params: BBSFormParams): BBSFormSectionConfig[] {
  const {
    publicId,
    sharedUrl,
    sharedToken,
    title,
    setTitle,
    maxMessages,
    setMaxMessages,
    webhookUrl,
    setWebhookUrl,
    messagesPerPage,
    setMessagesPerPage,
    standardSelectLabel,
    setStandardSelectLabel,
    standardSelectOptions,
    setStandardSelectOptions,
    incrementalSelectLabel,
    setIncrementalSelectLabel,
    incrementalSelectOptions,
    setIncrementalSelectOptions,
    emoteSelectLabel,
    setEmoteSelectLabel,
    emoteSelectOptions,
    setEmoteSelectOptions,
    postAuthor,
    postMessage,
    standardValue,
    incrementalValue,
    emoteValue,
    messageId,
    editMessage,
    setPostAuthor,
    setPostMessage,
    setStandardValue,
    setIncrementalValue,
    setEmoteValue,
    setMessageId,
    setEditMessage,
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
  } = params;

  return [
    // 1. メッセージ投稿
    {
      title: "◆ メッセージ投稿 ◆",
      apiUrl: `/bbs?action=post&id=${encodeURIComponent(publicId || "公開ID")}&author=${encodeURIComponent(postAuthor || "投稿者名")}&message=${encodeURIComponent(postMessage || "メッセージ")}${standardValue ? `&select1=${encodeURIComponent(standardValue)}` : ""}${incrementalValue ? `&select2=${encodeURIComponent(incrementalValue)}` : ""}${emoteValue ? `&icon=${encodeURIComponent(emoteValue)}` : ""}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=post&id=
          <GreenParam>{publicId || "公開ID"}</GreenParam>
          &author=<GreenParam>{postAuthor || "投稿者名"}</GreenParam>
          &message=<GreenParam>{postMessage || "メッセージ"}</GreenParam>
          {standardValue && (
            <>
              &select1=<GreenParam>{standardValue}</GreenParam>
            </>
          )}
          {incrementalValue && (
            <>
              &select2=<GreenParam>{incrementalValue}</GreenParam>
            </>
          )}
          {emoteValue && (
            <>
              &icon=<GreenParam>{emoteValue}</GreenParam>
            </>
          )}
        </>
      ),
      fields: [
        {
          name: "postAuthor",
          label: "投稿者名",
          type: "text",
          placeholder: "投稿者名を入力",
          value: postAuthor,
          onChange: setPostAuthor,
        },
        {
          name: "postMessage",
          label: "メッセージ",
          type: "text",
          placeholder: "メッセージを入力",
          value: postMessage,
          onChange: setPostMessage,
        },
        {
          name: "standardValue",
          label: "セレクト1値（任意）",
          type: "text",
          placeholder: "セレクト1値",
          value: standardValue,
          onChange: setStandardValue,
        },
        {
          name: "incrementalValue",
          label: "セレクト2値（任意）",
          type: "text",
          placeholder: "セレクト2値",
          value: incrementalValue,
          onChange: setIncrementalValue,
        },
        {
          name: "emoteValue",
          label: "アイコン値（任意）",
          type: "text",
          placeholder: "アイコン値",
          value: emoteValue,
          onChange: setEmoteValue,
        },
      ],
      buttonText: "投稿",
      onSubmit: handlePost,
      response: postResponse,
    },

    // 2. BBS取得（Public ID使用）
    {
      title: "◆ BBS取得 ◆",
      apiUrl: `/bbs?action=get&id=${encodeURIComponent(publicId || "パブリックID")}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=get&id=
          <GreenParam>{publicId || "パブリックID"}</GreenParam>
        </>
      ),
      fields: [],
      buttonText: "取得",
      onSubmit: handleGet,
      response: getResponse,
    },

    // 公開IDを再確認
    {
      title: "◆公開IDを再確認したいときは？◆",
      apiUrl: `/bbs?action=create&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=create&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
        </>
      ),
      fields: [],
      buttonText: "公開ID確認",
      onSubmit: handleCreate,
      response: createResponse,
    },

    // 3. メッセージ編集（URL/Token使用 - 管理者用）
    {
      title: "◆ メッセージ編集（管理者） ◆",
      apiUrl: `/bbs?action=update&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&messageId=${messageId || "メッセージID"}&message=${encodeURIComponent(editMessage || "新しいメッセージ")}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=update&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
          &messageId=<GreenParam>{messageId || "メッセージID"}</GreenParam>
          &message=<GreenParam>{editMessage || "新しいメッセージ"}</GreenParam>
        </>
      ),
      fields: [
        {
          name: "messageId",
          label: "メッセージID",
          type: "text",
          placeholder: "編集対象メッセージID",
          value: messageId,
          onChange: setMessageId,
        },
        {
          name: "editMessage",
          label: "新しいメッセージ",
          type: "text",
          placeholder: "編集後メッセージ",
          value: editMessage,
          onChange: setEditMessage,
        },
      ],
      buttonText: "編集",
      onSubmit: handleUpdate,
      response: updateResponse,
    },

    // 4. メッセージ削除（URL/Token使用 - 管理者用）
    {
      title: "◆ メッセージ削除（管理者） ◆",
      apiUrl: `/bbs?action=remove&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&messageId=${messageId || "メッセージID"}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=remove&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
          &messageId=<GreenParam>{messageId || "メッセージID"}</GreenParam>
        </>
      ),
      fields: [
        {
          name: "messageId",
          label: "メッセージID",
          type: "text",
          placeholder: "削除対象メッセージID",
          value: messageId,
          onChange: setMessageId,
        },
      ],
      buttonText: "削除",
      onSubmit: handleRemove,
      response: removeResponse,
    },

    // 5. メッセージ編集（投稿者用 - IP+UserAgentで自動認証）
    {
      title: "◆ メッセージ編集（投稿者） ◆",
      apiUrl: `/bbs?action=update&id=${encodeURIComponent(publicId || "パブリックID")}&messageId=${messageId || "メッセージID"}&message=${encodeURIComponent(editMessage || "新しいメッセージ")}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=update&id=
          <GreenParam>{publicId || "パブリックID"}</GreenParam>
          &messageId=<GreenParam>{messageId || "メッセージID"}</GreenParam>
          &message=<GreenParam>{editMessage || "新しいメッセージ"}</GreenParam>
        </>
      ),
      fields: [
        {
          name: "messageId",
          label: "メッセージID",
          type: "text",
          placeholder: "編集対象メッセージID",
          value: messageId,
          onChange: setMessageId,
        },
        {
          name: "editMessage",
          label: "新しいメッセージ",
          type: "text",
          placeholder: "編集後メッセージ",
          value: editMessage,
          onChange: setEditMessage,
        },
      ],
      buttonText: "編集",
      onSubmit: handleEditMessageById,
      response: updateResponse,
    },

    // 6. メッセージ削除（投稿者用 - IP+UserAgentで自動認証）
    {
      title: "◆ メッセージ削除（投稿者） ◆",
      apiUrl: `/bbs?action=remove&id=${encodeURIComponent(publicId || "パブリックID")}&messageId=${messageId || "メッセージID"}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=remove&id=
          <GreenParam>{publicId || "パブリックID"}</GreenParam>
          &messageId=<GreenParam>{messageId || "メッセージID"}</GreenParam>
        </>
      ),
      fields: [
        {
          name: "messageId",
          label: "メッセージID",
          type: "text",
          placeholder: "削除対象メッセージID",
          value: messageId,
          onChange: setMessageId,
        },
      ],
      buttonText: "削除",
      onSubmit: handleDeleteMessageById,
      response: removeResponse,
    },

    // 7. 全メッセージ削除
    {
      title: "◆ 全メッセージ削除 ◆",
      apiUrl: `/bbs?action=clear&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=clear&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
        </>
      ),
      fields: [],
      buttonText: "全削除",
      onSubmit: handleClear,
      response: clearResponse,
    },

    // 8. BBS削除
    {
      title: "◆ BBS削除 ◆",
      apiUrl: `/bbs?action=delete&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=delete&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
        </>
      ),
      fields: [],
      buttonText: "削除",
      onSubmit: handleDelete,
      response: deleteResponse,
    },

    // 9. 設定更新
    {
      title: "◆ 設定更新 ◆",
      apiUrl: `/bbs?action=update&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${title ? `&title=${encodeURIComponent(title)}` : ""}${maxMessages ? `&maxMessages=${maxMessages}` : ""}${messagesPerPage ? `&messagesPerPage=${messagesPerPage}` : ""}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}${standardSelectLabel ? `&standardSelectLabel=${encodeURIComponent(standardSelectLabel)}&standardSelectOptions=${encodeURIComponent(standardSelectOptions)}` : ""}${incrementalSelectLabel ? `&incrementalSelectLabel=${encodeURIComponent(incrementalSelectLabel)}&incrementalSelectOptions=${encodeURIComponent(incrementalSelectOptions)}` : ""}${emoteSelectLabel ? `&emoteSelectLabel=${encodeURIComponent(emoteSelectLabel)}&emoteSelectOptions=${encodeURIComponent(emoteSelectOptions)}` : ""}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=update&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
          {title && (
            <>
              &title=<GreenParam>{title}</GreenParam>
            </>
          )}
          {maxMessages && (
            <>
              &maxMessages=<GreenParam>{maxMessages}</GreenParam>
            </>
          )}
          {messagesPerPage && (
            <>
              &messagesPerPage=<GreenParam>{messagesPerPage}</GreenParam>
            </>
          )}
          {webhookUrl && (
            <>
              &webhookUrl=<GreenParam>{webhookUrl}</GreenParam>
            </>
          )}
          {standardSelectLabel && (
            <>
              &standardSelectLabel=<GreenParam>{standardSelectLabel}</GreenParam>
              &standardSelectOptions=<GreenParam>{standardSelectOptions}</GreenParam>
            </>
          )}
          {incrementalSelectLabel && (
            <>
              &incrementalSelectLabel=<GreenParam>{incrementalSelectLabel}</GreenParam>
              &incrementalSelectOptions=<GreenParam>{incrementalSelectOptions}</GreenParam>
            </>
          )}
          {emoteSelectLabel && (
            <>
              &emoteSelectLabel=<GreenParam>{emoteSelectLabel}</GreenParam>
              &emoteSelectOptions=<GreenParam>{emoteSelectOptions}</GreenParam>
            </>
          )}
        </>
      ),
      fields: [
        {
          name: "title",
          label: "タイトル",
          type: "text" as const,
          placeholder: "BBS",
          value: title,
          onChange: setTitle,
        },
        {
          name: "maxMessages",
          label: "最大メッセージ数",
          type: "number" as const,
          placeholder: "100",
          value: maxMessages,
          onChange: setMaxMessages,
        },
        {
          name: "messagesPerPage",
          label: "1ページあたり件数",
          type: "number" as const,
          placeholder: "20",
          value: messagesPerPage,
          onChange: setMessagesPerPage,
        },
        {
          name: "webhookUrl",
          label: "Webhook URL",
          type: "url" as const,
          placeholder: "https://hooks.slack.com/...",
          value: webhookUrl,
          onChange: setWebhookUrl,
        },
        {
          name: "standardSelectLabel",
          label: "セレクト1ラベル",
          type: "text" as const,
          placeholder: "カテゴリ",
          value: standardSelectLabel,
          onChange: setStandardSelectLabel,
        },
        {
          name: "standardSelectOptions",
          label: "セレクト1選択肢",
          type: "text" as const,
          placeholder: "質問,雑談,報告（カンマ区切り）",
          value: standardSelectOptions,
          onChange: setStandardSelectOptions,
        },
        {
          name: "incrementalSelectLabel",
          label: "セレクト2ラベル",
          type: "text" as const,
          placeholder: "優先度",
          value: incrementalSelectLabel,
          onChange: setIncrementalSelectLabel,
        },
        {
          name: "incrementalSelectOptions",
          label: "セレクト2選択肢",
          type: "text" as const,
          placeholder: "低,中,高（カンマ区切り）",
          value: incrementalSelectOptions,
          onChange: setIncrementalSelectOptions,
        },
        {
          name: "emoteSelectLabel",
          label: "アイコンラベル",
          type: "text" as const,
          placeholder: "気分",
          value: emoteSelectLabel,
          onChange: setEmoteSelectLabel,
        },
        {
          name: "emoteSelectOptions",
          label: "アイコン選択肢",
          type: "text" as const,
          placeholder: "😊,😢,😡（カンマ区切り）",
          value: emoteSelectOptions,
          onChange: setEmoteSelectOptions,
        },
      ],
      buttonText: "更新",
      onSubmit: handleUpdateSettings,
      response: updateSettingsResponse,
    },
  ];
}
