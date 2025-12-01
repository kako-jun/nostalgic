import { ReactNode } from "react";
import ActionSection from "./sections/ActionSection";
import ApiUrlDisplay from "./ApiUrlDisplay";
import SimpleForm from "./forms/SimpleForm";

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "url" | "number";
  placeholder?: string;
  required?: boolean;
  width?: string;
  value: string;
  onChange: (value: string) => void;
}

export interface FormSectionConfig {
  title: string;
  description?: ReactNode;
  apiUrl: string;
  apiUrlDisplay: ReactNode;
  fields: FormField[];
  onSubmit: (e: React.FormEvent) => void;
  buttonText: string;
  response: string;
  responseType?: "json" | "text" | "svg";
  additionalContent?: ReactNode;
}

export default function GenericFormSection({
  title,
  description,
  apiUrl,
  apiUrlDisplay,
  fields,
  onSubmit,
  buttonText,
  response,
  responseType = "json",
  additionalContent,
}: FormSectionConfig) {
  return (
    <ActionSection title={title}>
      {description && <p>{description}</p>}
      <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
      <ApiUrlDisplay url={apiUrl}>{apiUrlDisplay}</ApiUrlDisplay>

      {additionalContent}

      <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />

      <p>または、以下のフォームで実行できます。</p>

      <SimpleForm
        onSubmit={onSubmit}
        buttonText={buttonText}
        response={response}
        responseType={responseType}
      >
        {fields.map((field) => (
          <p key={field.name}>
            <b>{field.label}：</b>
            <input
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              type={field.type || "text"}
              placeholder={field.placeholder || ""}
              style={{
                width: field.width || "60%",
                padding: "4px",
                border: "1px solid #666",
                fontFamily: "inherit",
                fontSize: "16px",
              }}
              required={field.required}
            />
          </p>
        ))}
      </SimpleForm>
    </ActionSection>
  );
}
