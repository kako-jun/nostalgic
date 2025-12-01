import ApiUrlDisplay, { GreenParam } from "../ApiUrlDisplay";
import ActionSection from "../sections/ActionSection";
import SimpleForm from "../forms/SimpleForm";
import InputField from "../forms/InputField";

interface CreateServiceSectionProps {
  serviceName: string;
  apiEndpoint: string;
  sharedUrl: string;
  setSharedUrl: (value: string) => void;
  sharedToken: string;
  setSharedToken: (value: string) => void;
  webhookUrl?: string;
  setWebhookUrl?: (value: string) => void;
  onCreateSubmit: (e: React.FormEvent) => void;
  createResponse: string;
  additionalParams?: string;
  children?: React.ReactNode;
}

export default function CreateServiceSection({
  serviceName,
  apiEndpoint,
  sharedUrl,
  setSharedUrl,
  sharedToken,
  setSharedToken,
  webhookUrl = "",
  setWebhookUrl,
  onCreateSubmit,
  createResponse,
  additionalParams = "",
  children,
}: CreateServiceSectionProps) {
  const webhookParam = webhookUrl ? `&webhookUrl=${encodeURIComponent(webhookUrl)}` : "";
  const fullUrl = `https://nostalgic.llll-ll.com${apiEndpoint}?action=create&url=${encodeURIComponent(sharedUrl || "サイトURL")}&token=${encodeURIComponent(sharedToken || "オーナートークン")}${additionalParams}${webhookParam}`;

  return (
    <ActionSection title={`◆STEP 1: ${serviceName}作成◆`}>
      <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
      <ApiUrlDisplay url={fullUrl}>
        https://nostalgic.llll-ll.com{apiEndpoint}?action=create&url=
        <GreenParam>{sharedUrl || "サイトURL"}</GreenParam>
        &token=<GreenParam>{sharedToken || "オーナートークン"}</GreenParam>
        {additionalParams && <span dangerouslySetInnerHTML={{ __html: additionalParams }} />}
        {webhookUrl && (
          <>
            &webhookUrl=<GreenParam>{encodeURIComponent(webhookUrl)}</GreenParam>
          </>
        )}
      </ApiUrlDisplay>
      <p>
        ※サイトURLには、{serviceName}
        を設置する予定のサイトを指定してください。「https://」から始まっている必要があります。
        <br />
        ※オーナートークンに、
        <span style={{ color: "#ff0000" }}>ほかのサイトでのパスワードを使い回さないでください</span>
        。（8-16文字）
      </p>
      <p>
        上記URLにアクセスすると、JSONで公開IDが返されます。この公開IDをSTEP 2で使用してください。
      </p>

      <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />

      <p style={{ marginTop: "20px" }}>または、以下のフォームで簡単に作成できます。</p>

      <SimpleForm onSubmit={onCreateSubmit} buttonText="作成" response={createResponse}>
        <InputField
          label="サイトURL"
          value={sharedUrl}
          onChange={setSharedUrl}
          type="url"
          placeholder="https://example.com"
          required
        />
        <InputField
          label="オーナートークン"
          value={sharedToken}
          onChange={setSharedToken}
          placeholder="8-16文字"
          required
          width="30%"
        />
        {setWebhookUrl && (
          <InputField
            label="Webhook URL（オプション）"
            value={webhookUrl}
            onChange={setWebhookUrl}
            type="url"
            placeholder="https://hooks.slack.com/services/..."
          />
        )}
        {children}
      </SimpleForm>
    </ActionSection>
  );
}
