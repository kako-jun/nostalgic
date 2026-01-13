import { ReactNode } from "react";

export const API_BASE = "https://api.nostalgic.llll-ll.com";

// Field types
export type FieldType = "text" | "url" | "number" | "select";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  width?: string;
  options?: FieldOption[];
}

// Step configuration
export type ButtonVariant = "primary" | "warning" | "danger" | "secondary";

export interface StepConfig {
  id: string;
  title: string;
  description?: string;
  fields: FieldConfig[];
  buttonText: string;
  buttonVariant?: ButtonVariant;
  warningMessage?: ReactNode;
  // API URL generation functions - will be called with current state values
  buildApiUrl: (values: Record<string, string>) => string;
  buildApiUrlDisplay: (values: Record<string, string>) => ReactNode;
  // Handler key - maps to the handler function in the page
  handlerKey: string;
  // Response key - maps to the response state in the page
  responseKey: string;
  // Response type for display
  responseType?: "json" | "text" | "svg";
  // Additional content to show between API URL and form
  additionalContent?: ReactNode;
}

// Common field definitions
export const COMMON_FIELDS = {
  url: {
    name: "url",
    label: "サイトURL",
    type: "url" as const,
    placeholder: "https://example.com",
    required: true,
  },
  token: {
    name: "token",
    label: "オーナートークン",
    type: "text" as const,
    placeholder: "8-16文字",
    required: true,
    width: "30%",
  },
  publicId: {
    name: "publicId",
    label: "公開ID",
    type: "text" as const,
    placeholder: "STEP 1で作成後に表示されます",
    width: "40%",
  },
  webhookUrl: {
    name: "webhookUrl",
    label: "Webhook URL（オプション）",
    type: "url" as const,
    placeholder: "https://hooks.slack.com/services/...",
  },
  format: {
    name: "format",
    label: "形式",
    type: "select" as const,
    width: "30%",
    options: [
      { value: "json", label: "JSON" },
      { value: "text", label: "テキスト" },
      { value: "image", label: "SVG画像" },
    ],
  },
};
