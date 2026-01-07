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
  maxMessages: string;
  setMaxMessages: (value: string) => void;
  webhookUrl: string;
  setWebhookUrl: (value: string) => void;
  postAuthor: string;
  postMessage: string;
  standardValue: string;
  incrementalValue: string;
  emoteValue: string;
  messageId: string;
  editAuthor: string;
  editMessage: string;
  editToken: string;
  editStandardValue: string;
  editIncrementalValue: string;
  editEmoteValue: string;
  setPostAuthor: (value: string) => void;
  setPostMessage: (value: string) => void;
  setStandardValue: (value: string) => void;
  setIncrementalValue: (value: string) => void;
  setEmoteValue: (value: string) => void;
  setMessageId: (value: string) => void;
  setEditAuthor: (value: string) => void;
  setEditMessage: (value: string) => void;
  setEditToken: (value: string) => void;
  setEditStandardValue: (value: string) => void;
  setEditIncrementalValue: (value: string) => void;
  setEditEmoteValue: (value: string) => void;
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

    // 3. メッセージ編集（URL/Token使用）
    {
      title: "◆ メッセージ編集（URL/Token） ◆",
      apiUrl: `/bbs?action=update&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}&messageId=${messageId || "メッセージID"}&author=${encodeURIComponent(editAuthor || "投稿者名")}&message=${encodeURIComponent(editMessage || "新しいメッセージ")}${editStandardValue ? `&standardValue=${encodeURIComponent(editStandardValue)}` : ""}${editIncrementalValue ? `&incrementalValue=${encodeURIComponent(editIncrementalValue)}` : ""}${editEmoteValue ? `&emoteValue=${encodeURIComponent(editEmoteValue)}` : ""}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=update&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
          &messageId=<GreenParam>{messageId || "メッセージID"}</GreenParam>
          &author=<GreenParam>{editAuthor || "投稿者名"}</GreenParam>
          &message=<GreenParam>{editMessage || "新しいメッセージ"}</GreenParam>
          {editStandardValue && (
            <>
              &standardValue=<GreenParam>{editStandardValue}</GreenParam>
            </>
          )}
          {editIncrementalValue && (
            <>
              &incrementalValue=<GreenParam>{editIncrementalValue}</GreenParam>
            </>
          )}
          {editEmoteValue && (
            <>
              &emoteValue=<GreenParam>{editEmoteValue}</GreenParam>
            </>
          )}
        </>
      ),
      fields: [
        {
          name: "messageId",
          label: "メッセージID",
          type: "text",
          placeholder: "編集対象メッセージID（トークン認証）",
          value: messageId,
          onChange: setMessageId,
        },
        {
          name: "editAuthor",
          label: "投稿者名",
          type: "text",
          placeholder: "編集後投稿者名（トークン認証）",
          value: editAuthor,
          onChange: setEditAuthor,
        },
        {
          name: "editMessage",
          label: "新しいメッセージ",
          type: "text",
          placeholder: "編集後メッセージ（トークン認証）",
          value: editMessage,
          onChange: setEditMessage,
        },
        {
          name: "editStandardValue",
          label: "標準セレクト値（任意）",
          type: "text",
          placeholder: "標準セレクト値（トークン認証）",
          value: editStandardValue,
          onChange: setEditStandardValue,
        },
        {
          name: "editIncrementalValue",
          label: "増分セレクト値（任意）",
          type: "text",
          placeholder: "増分セレクト値（トークン認証）",
          value: editIncrementalValue,
          onChange: setEditIncrementalValue,
        },
        {
          name: "editEmoteValue",
          label: "エモートセレクト値（任意）",
          type: "text",
          placeholder: "エモートセレクト値（トークン認証）",
          value: editEmoteValue,
          onChange: setEditEmoteValue,
        },
      ],
      buttonText: "編集",
      onSubmit: handleUpdate,
      response: updateResponse,
    },

    // 4. メッセージ削除（URL/Token使用）
    {
      title: "◆ メッセージ削除（URL/Token） ◆",
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
          placeholder: "削除対象メッセージID（トークン認証）",
          value: messageId,
          onChange: setMessageId,
        },
      ],
      buttonText: "削除",
      onSubmit: handleRemove,
      response: removeResponse,
    },

    // 5. メッセージ編集（Public ID + editToken使用）
    {
      title: "◆ メッセージ編集（Public ID） ◆",
      apiUrl: `/bbs?action=update&id=${encodeURIComponent(publicId || "パブリックID")}&messageId=${messageId || "メッセージID"}&author=${encodeURIComponent(editAuthor || "投稿者名")}&message=${encodeURIComponent(editMessage || "新しいメッセージ")}&editToken=${encodeURIComponent(editToken || "編集トークン")}${editStandardValue ? `&standardValue=${encodeURIComponent(editStandardValue)}` : ""}${editIncrementalValue ? `&incrementalValue=${encodeURIComponent(editIncrementalValue)}` : ""}${editEmoteValue ? `&emoteValue=${encodeURIComponent(editEmoteValue)}` : ""}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=update&id=
          <GreenParam>{publicId || "パブリックID"}</GreenParam>
          &messageId=<GreenParam>{messageId || "メッセージID"}</GreenParam>
          &author=<GreenParam>{editAuthor || "投稿者名"}</GreenParam>
          &message=<GreenParam>{editMessage || "新しいメッセージ"}</GreenParam>
          &editToken=<GreenParam>{editToken || "編集トークン"}</GreenParam>
          {editStandardValue && (
            <>
              &standardValue=<GreenParam>{editStandardValue}</GreenParam>
            </>
          )}
          {editIncrementalValue && (
            <>
              &incrementalValue=<GreenParam>{editIncrementalValue}</GreenParam>
            </>
          )}
          {editEmoteValue && (
            <>
              &emoteValue=<GreenParam>{editEmoteValue}</GreenParam>
            </>
          )}
        </>
      ),
      fields: [
        {
          name: "messageId",
          label: "メッセージID",
          type: "text",
          placeholder: "編集対象メッセージID（公開ID認証）",
          value: messageId,
          onChange: setMessageId,
        },
        {
          name: "editAuthor",
          label: "投稿者名",
          type: "text",
          placeholder: "編集後投稿者名（公開ID認証）",
          value: editAuthor,
          onChange: setEditAuthor,
        },
        {
          name: "editMessage",
          label: "新しいメッセージ",
          type: "text",
          placeholder: "編集後メッセージ（公開ID認証）",
          value: editMessage,
          onChange: setEditMessage,
        },
        {
          name: "editToken",
          label: "編集トークン",
          type: "text",
          placeholder: "編集トークン（公開ID認証）",
          value: editToken,
          onChange: setEditToken,
        },
        {
          name: "editStandardValue",
          label: "標準セレクト値（任意）",
          type: "text",
          placeholder: "標準セレクト値（公開ID認証）",
          value: editStandardValue,
          onChange: setEditStandardValue,
        },
        {
          name: "editIncrementalValue",
          label: "増分セレクト値（任意）",
          type: "text",
          placeholder: "増分セレクト値（公開ID認証）",
          value: editIncrementalValue,
          onChange: setEditIncrementalValue,
        },
        {
          name: "editEmoteValue",
          label: "エモートセレクト値（任意）",
          type: "text",
          placeholder: "エモートセレクト値（公開ID認証）",
          value: editEmoteValue,
          onChange: setEditEmoteValue,
        },
      ],
      buttonText: "編集",
      onSubmit: handleEditMessageById,
      response: updateResponse,
    },

    // 6. メッセージ削除（Public ID + editToken使用）
    {
      title: "◆ メッセージ削除（Public ID） ◆",
      apiUrl: `/bbs?action=remove&id=${encodeURIComponent(publicId || "パブリックID")}&messageId=${messageId || "メッセージID"}&editToken=${encodeURIComponent(editToken || "編集トークン")}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=remove&id=
          <GreenParam>{publicId || "パブリックID"}</GreenParam>
          &messageId=<GreenParam>{messageId || "メッセージID"}</GreenParam>
          &editToken=<GreenParam>{editToken || "編集トークン"}</GreenParam>
        </>
      ),
      fields: [
        {
          name: "messageId",
          label: "メッセージID",
          type: "text",
          placeholder: "削除対象メッセージID（公開ID認証）",
          value: messageId,
          onChange: setMessageId,
        },
        {
          name: "editToken",
          label: "編集トークン",
          type: "text",
          placeholder: "削除用編集トークン（公開ID認証）",
          value: editToken,
          onChange: setEditToken,
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
      apiUrl: `/bbs?action=update&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${maxMessages ? `&maxMessages=${maxMessages}` : ""}${webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : ""}`,
      apiUrlDisplay: (
        <>
          https://api.nostalgic.llll-ll.com/bbs?action=update&url=
          <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
          &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
          {maxMessages && (
            <>
              &maxMessages=<GreenParam>{maxMessages}</GreenParam>
            </>
          )}
          {webhookUrl && (
            <>
              &webhookUrl=<GreenParam>{webhookUrl}</GreenParam>
            </>
          )}
        </>
      ),
      fields: [
        {
          name: "maxMessages",
          label: "最大メッセージ数",
          type: "number" as const,
          placeholder: "100",
          value: maxMessages,
          onChange: setMaxMessages,
        },
        {
          name: "webhookUrl",
          label: "Webhook URL",
          type: "url" as const,
          placeholder: "https://hooks.slack.com/...",
          value: webhookUrl,
          onChange: setWebhookUrl,
        },
      ],
      buttonText: "更新",
      onSubmit: handleUpdateSettings,
      response: updateSettingsResponse,
    },
  ];
}
