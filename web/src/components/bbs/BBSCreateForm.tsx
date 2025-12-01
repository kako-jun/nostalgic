import FormField from "../forms/FormField";
import ActionFormSection from "../sections/ActionFormSection";
import SectionDivider from "../common/SectionDivider";

interface BBSCreateFormProps {
  sharedUrl: string;
  setSharedUrl: (value: string) => void;
  sharedToken: string;
  setSharedToken: (value: string) => void;
  webhookUrl: string;
  setWebhookUrl: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  maxMessages: string;
  setMaxMessages: (value: string) => void;
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
  onSubmit: (e: React.FormEvent) => void;
  response: string;
}

export default function BBSCreateForm(props: BBSCreateFormProps) {
  return (
    <ActionFormSection title="BBS作成フォーム" response={props.response}>
      <form onSubmit={props.onSubmit} style={{ marginTop: "10px" }}>
        <FormField
          label="サイトURL"
          value={props.sharedUrl}
          onChange={props.setSharedUrl}
          placeholder="https://example.com"
          required
        />
        <FormField
          label="オーナートークン"
          value={props.sharedToken}
          onChange={props.setSharedToken}
          placeholder="8-16文字"
          required
        />
        <FormField label="Webhook URL" value={props.webhookUrl} onChange={props.setWebhookUrl} />
        <FormField label="タイトル" value={props.title} onChange={props.setTitle} />
        <FormField
          label="最大メッセージ数"
          type="number"
          value={props.maxMessages}
          onChange={props.setMaxMessages}
          placeholder="100"
        />
        <FormField
          label="ページあたりメッセージ数"
          type="number"
          value={props.messagesPerPage}
          onChange={props.setMessagesPerPage}
          placeholder="20"
        />

        <SectionDivider />
        <p>
          <b>標準セレクト設定（オプション）</b>
        </p>
        <FormField
          label="ラベル"
          value={props.standardSelectLabel}
          onChange={props.setStandardSelectLabel}
        />
        <FormField
          label="選択肢"
          value={props.standardSelectOptions}
          onChange={props.setStandardSelectOptions}
          placeholder="選択1,選択2,選択3"
        />

        <SectionDivider />
        <p>
          <b>インクリメンタルセレクト設定（オプション）</b>
        </p>
        <FormField
          label="ラベル"
          value={props.incrementalSelectLabel}
          onChange={props.setIncrementalSelectLabel}
        />
        <FormField
          label="選択肢"
          value={props.incrementalSelectOptions}
          onChange={props.setIncrementalSelectOptions}
          placeholder="選択1,選択2,選択3"
        />

        <SectionDivider />
        <p>
          <b>エモートセレクト設定（オプション）</b>
        </p>
        <FormField
          label="ラベル"
          value={props.emoteSelectLabel}
          onChange={props.setEmoteSelectLabel}
        />
        <FormField
          label="選択肢"
          value={props.emoteSelectOptions}
          onChange={props.setEmoteSelectOptions}
          placeholder="😀,😂,😍"
        />

        <button type="submit">作成</button>
      </form>
    </ActionFormSection>
  );
}
