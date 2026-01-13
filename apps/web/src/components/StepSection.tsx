import ApiUrlDisplay from "./ApiUrlDisplay";
import ResponseDisplay from "./ResponseDisplay";
import NostalgicButton from "./NostalgicButton";
import SectionDivider from "./common/SectionDivider";
import type { StepConfig, FieldConfig } from "../config/commonSteps";

interface FieldValue {
  value: string;
  onChange: (value: string) => void;
}

interface StepSectionProps {
  config: StepConfig;
  fieldValues: Record<string, FieldValue>;
  onSubmit: (e: React.FormEvent) => void;
  response: string;
  responseType?: "json" | "text" | "svg";
  // For create step specific features
  isCreateStep?: boolean;
  serviceName?: string;
}

function renderField(field: FieldConfig, fieldValue: FieldValue) {
  const { value, onChange } = fieldValue;

  if (field.type === "select") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: field.width || "30%",
          padding: "4px",
          border: "1px solid #666",
          fontFamily: "inherit",
          fontSize: "16px",
        }}
      >
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={field.type}
      placeholder={field.placeholder || ""}
      min={field.type === "number" ? "0" : undefined}
      style={{
        width: field.width || "60%",
        padding: "4px",
        border: "1px solid #666",
        fontFamily: field.name === "publicId" ? "monospace" : "inherit",
        fontSize: "16px",
      }}
      required={field.required}
    />
  );
}

export default function StepSection({
  config,
  fieldValues,
  onSubmit,
  response,
  responseType = "json",
  isCreateStep = false,
  serviceName,
}: StepSectionProps) {
  // Build values object from fieldValues for API URL generation
  const values: Record<string, string> = {};
  for (const [key, fv] of Object.entries(fieldValues)) {
    values[key] = fv.value;
  }

  const apiUrl = config.buildApiUrl(values);
  const apiUrlDisplay = config.buildApiUrlDisplay(values);

  return (
    <div className="nostalgic-section">
      <p>
        <span className="nostalgic-section-title">
          <b>{config.title}</b>
        </span>
      </p>

      {config.description && <p>{config.description}</p>}

      <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
      <ApiUrlDisplay url={apiUrl}>{apiUrlDisplay}</ApiUrlDisplay>

      {isCreateStep && serviceName && (
        <p>
          ※サイトURLには、{serviceName}
          を設置する予定のサイトを指定してください。「https://」から始まっている必要があります。
          <br />
          ※オーナートークンに、
          <span style={{ color: "#ff0000" }}>
            ほかのサイトでのパスワードを使い回さないでください
          </span>
          。（8-16文字）
        </p>
      )}

      {isCreateStep && (
        <p>
          上記URLにアクセスすると、JSONで公開IDが返されます。この公開IDをSTEP 2で使用してください。
        </p>
      )}

      {config.additionalContent}

      <SectionDivider />

      <p style={isCreateStep ? { marginTop: "20px" } : undefined}>
        {isCreateStep
          ? "または、以下のフォームで簡単に作成できます。"
          : "または、以下のフォームで実行できます。"}
      </p>

      {config.warningMessage}

      <form style={{ marginTop: "10px" }} onSubmit={onSubmit}>
        {config.fields.map((field) => {
          const fieldValue = fieldValues[field.name];
          if (!fieldValue) return null;

          return (
            <p key={field.name}>
              <b>{field.label}：</b>
              {renderField(field, fieldValue)}
            </p>
          );
        })}
        <p>
          <NostalgicButton type="submit" variant={config.buttonVariant || "primary"}>
            {config.buttonText}
          </NostalgicButton>
        </p>
      </form>

      {response && (
        <ResponseDisplay
          response={response}
          responseType={config.responseType || responseType}
          show={true}
        />
      )}
    </div>
  );
}
