import { ReactNode } from "react";
import ApiUrlDisplay from "./ApiUrlDisplay";
import ResponseDisplay from "./ResponseDisplay";
import NostalgicButton, { type ButtonVariant } from "./NostalgicButton";
import SectionDivider from "./common/SectionDivider";

type FieldType = "text" | "url" | "number" | "select";

interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  width?: string;
  value: string;
  onChange: (value: string) => void;
  options?: Array<{ value: string; label: string }>;
}

interface FormSectionProps {
  title: string;
  description?: ReactNode;
  apiUrl: string;
  apiUrlDisplay: ReactNode;
  fields: FormFieldConfig[];
  buttonText: string;
  buttonVariant?: ButtonVariant;
  onSubmit: (e: React.FormEvent) => void;
  response: string;
  responseType?: "json" | "text" | "svg";
  warningMessage?: ReactNode;
  additionalContent?: ReactNode;
}

export default function DataDrivenFormSection({
  title,
  description,
  apiUrl,
  apiUrlDisplay,
  fields,
  buttonText,
  buttonVariant = "primary",
  onSubmit,
  response,
  responseType = "json",
  warningMessage,
  additionalContent,
}: FormSectionProps) {
  return (
    <div className="nostalgic-section">
      <p>
        <span className="nostalgic-section-title">
          <b>{title}</b>
        </span>
      </p>
      {description && <p>{description}</p>}
      <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
      <ApiUrlDisplay url={apiUrl}>{apiUrlDisplay}</ApiUrlDisplay>

      {additionalContent}

      <SectionDivider />

      <p>または、以下のフォームで実行できます。</p>
      {warningMessage && warningMessage}

      <form style={{ marginTop: "10px" }} onSubmit={onSubmit}>
        {fields.map((field) => (
          <p key={field.name}>
            <b>{field.label}：</b>
            {field.type === "select" ? (
              <select
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
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
            ) : (
              <input
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
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
            )}
          </p>
        ))}
        <p>
          <NostalgicButton type="submit" variant={buttonVariant}>
            {buttonText}
          </NostalgicButton>
        </p>
      </form>

      {response && <ResponseDisplay response={response} responseType={responseType} show={true} />}
    </div>
  );
}
