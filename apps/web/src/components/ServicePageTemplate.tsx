import { ReactNode } from "react";
import NostalgicLayout from "./NostalgicLayout";
import CreateServiceSection from "./sections/CreateServiceSection";
import DataDrivenFormSection from "./DataDrivenFormSection";
import { PageFooter } from "./common";

interface EmbedAttribute {
  name: string;
  defaultValue: string;
  description: string;
}

interface EmbedOption {
  value: string;
  description: string;
}

interface EmbedSection {
  title: string;
  options: EmbedOption[];
}

interface ThemePreview {
  name: string;
  value: string;
}

interface EmbedPreview {
  themes: ThemePreview[];
  getUrl: (publicId: string, theme: string) => string;
}

interface EmbedDemo {
  themes: ThemePreview[];
  hint: string;
}

interface EmbedConfig {
  scriptUrl: string;
  componentName: string;
  attributes: EmbedAttribute[];
  sections: EmbedSection[];
  typescriptType: string;
  preview?: EmbedPreview;
  demo?: EmbedDemo;
}

interface FormSectionConfig {
  title: string;
  apiUrl: string;
  apiUrlDisplay: ReactNode;
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "url" | "number" | "select";
    placeholder?: string;
    required?: boolean;
    width?: string;
    value: string;
    onChange: (value: string) => void;
    options?: Array<{ value: string; label: string }>;
  }>;
  buttonText: string;
  buttonVariant?: "primary" | "warning" | "danger" | "secondary";
  onSubmit: (e: React.FormEvent) => void;
  response: string;
  responseType?: "json" | "text" | "svg";
  warningMessage?: ReactNode;
  additionalContent?: ReactNode;
}

interface ServicePageTemplateProps {
  // Service identity
  serviceName: string;
  serviceDisplayName: string;
  serviceIcon: string;
  servicePath: string;
  apiEndpoint: string;

  // Current page state
  currentPage: "features" | "usage";

  // Features tab component
  FeaturesTab: React.ComponentType;

  // Create section props
  sharedUrl: string;
  setSharedUrl: (v: string) => void;
  sharedToken: string;
  setSharedToken: (v: string) => void;
  webhookUrl?: string;
  setWebhookUrl?: (v: string) => void;
  onCreateSubmit: (e: React.FormEvent) => void;
  createResponse: string;
  createSectionChildren?: ReactNode;

  // Public ID for embed section
  publicId: string;

  // Form sections
  formSections: FormSectionConfig[];

  // Embed configuration
  embedConfig: EmbedConfig;
}

export default function ServicePageTemplate({
  serviceName,
  serviceDisplayName,
  serviceIcon,
  servicePath,
  apiEndpoint,
  currentPage,
  FeaturesTab,
  sharedUrl,
  setSharedUrl,
  sharedToken,
  setSharedToken,
  webhookUrl,
  setWebhookUrl,
  onCreateSubmit,
  createResponse,
  createSectionChildren,
  publicId,
  formSections,
  embedConfig,
}: ServicePageTemplateProps) {
  const renderEmbedCode = () => {
    const attrs = embedConfig.attributes
      .map((attr) => `${attr.name}="${attr.defaultValue}"`)
      .join(" ");
    return `<script src="${embedConfig.scriptUrl}"></script>
<${embedConfig.componentName} id="公開ID" ${attrs}></${embedConfig.componentName}>`;
  };

  const renderEmbedCodeWithId = () => {
    const attrs = embedConfig.attributes
      .map((attr) => `${attr.name}="${attr.defaultValue}"`)
      .join(" ");
    return `<script src="${embedConfig.scriptUrl}"></script>
<${embedConfig.componentName} id="${publicId}" ${attrs}></${embedConfig.componentName}>`;
  };

  const renderUsagePage = () => (
    <>
      <div className="nostalgic-title-bar">
        ★ Nostalgic {serviceDisplayName} ★
        <br />
        使い方
      </div>

      <CreateServiceSection
        serviceName={serviceName}
        apiEndpoint={apiEndpoint}
        sharedUrl={sharedUrl}
        setSharedUrl={setSharedUrl}
        sharedToken={sharedToken}
        setSharedToken={setSharedToken}
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
        onCreateSubmit={onCreateSubmit}
        createResponse={createResponse}
      >
        {createSectionChildren}
      </CreateServiceSection>

      {formSections.map((section, index) => (
        <DataDrivenFormSection key={index} {...section} />
      ))}

      <div className="nostalgic-section">
        <p>
          <span className="nostalgic-section-title">
            <b>◆STEP 3: {serviceName}埋め込み◆</b>
          </span>
        </p>
        <p>あなたのサイトのHTMLに以下のコードを追加してください。</p>
        <pre
          style={{
            backgroundColor: "#f0f0f0",
            padding: "10px",
            overflow: "auto",
            fontSize: "14px",
            margin: "10px 0",
          }}
        >
          {renderEmbedCode()
            .split("\n")
            .map((line, i) => (
              <span key={i}>
                {line}
                {i < 1 && <br />}
              </span>
            ))}
        </pre>

        {embedConfig.sections.map((section, idx) => (
          <div className="nostalgic-section" key={idx}>
            <p>
              <span className="nostalgic-section-title">
                <b>◆{section.title}◆</b>
              </span>
            </p>
            <p>
              {section.options.map((opt, optIdx) => (
                <span key={optIdx}>
                  • <span style={{ color: "#008000" }}>{opt.value}</span> - {opt.description}
                  {optIdx < section.options.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        ))}

        <div className="nostalgic-section">
          <p>
            <span className="nostalgic-section-title">
              <b>◆TypeScript使用時の設定◆</b>
            </span>
          </p>
          <p>
            TypeScriptプロジェクトでWeb Componentsを使用する場合、プロジェクトルートに{" "}
            <code>types.d.ts</code> ファイルを作成してください。
          </p>
          <pre
            style={{
              backgroundColor: "#f0f0f0",
              padding: "10px",
              overflow: "auto",
              fontSize: "12px",
              margin: "10px 0",
            }}
          >
            {embedConfig.typescriptType}
          </pre>
          <p style={{ fontSize: "14px", color: "#666" }}>
            ※この設定により、TypeScriptでWeb Componentsを使用してもビルドエラーが発生しません。
          </p>
        </div>

        {embedConfig.preview && (
          <div className="nostalgic-section">
            <p>
              <span className="nostalgic-section-title">
                <b>◆このように表示されます◆</b>
              </span>
            </p>
            {publicId ? (
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: "20px",
                    justifyItems: "center",
                    alignItems: "start",
                    maxWidth: "800px",
                    margin: "0 auto",
                  }}
                >
                  {embedConfig.preview.themes.map((theme) => (
                    <div key={theme.value} style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "14px", marginBottom: "10px" }}>{theme.name}</p>
                      <img
                        src={embedConfig.preview!.getUrl(publicId, theme.value)}
                        alt={`${theme.name} ${serviceName}`}
                        style={{ border: "1px solid #ccc" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  margin: "20px 0",
                  padding: "20px",
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #ddd",
                }}
              >
                <p style={{ fontSize: "14px", color: "#666" }}>
                  {serviceName}を作成すると、ここにプレビューが表示されます
                </p>
              </div>
            )}
          </div>
        )}

        {embedConfig.demo && publicId && (
          <div className="nostalgic-section">
            <p>
              <span className="nostalgic-section-title">
                <b>◆デモ用{serviceName}◆</b>
              </span>
            </p>
            <p style={{ marginBottom: "15px" }}>
              このデモページの{serviceName}（実際に動作します）：
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                justifyItems: "center",
              }}
            >
              {embedConfig.demo.themes.map((theme) => (
                <div key={theme.value}>
                  <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>
                    {theme.name}
                  </p>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: `<${embedConfig.componentName} id="${publicId}" theme="${theme.value}" limit="5"></${embedConfig.componentName}>`,
                    }}
                  />
                </div>
              ))}
            </div>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "15px" }}>
              {embedConfig.demo.hint}
            </p>
          </div>
        )}
      </div>

      {publicId && (
        <div className="nostalgic-section">
          <p>
            <span style={{ color: "#ff8c00" }}>
              <b>◆{serviceName}設置方法◆</b>
            </span>
          </p>
          <p>
            公開ID:{" "}
            <span
              style={{
                backgroundColor: "#ffff00",
                padding: "2px 4px",
                fontFamily: "monospace",
              }}
            >
              {publicId}
            </span>
          </p>
          <p
            style={{
              backgroundColor: "#f0f0f0",
              padding: "10px",
              fontFamily: "monospace",
              fontSize: "14px",
              wordBreak: "break-all",
            }}
          >
            {renderEmbedCodeWithId()}
          </p>
        </div>
      )}

      <PageFooter servicePath={servicePath} currentPage="usage" />
    </>
  );

  const renderFeaturesPage = () => (
    <>
      <FeaturesTab />
      <PageFooter servicePath={servicePath} currentPage="features" />
    </>
  );

  return (
    <NostalgicLayout serviceName={serviceDisplayName} serviceIcon={serviceIcon}>
      {currentPage === "usage" ? renderUsagePage() : renderFeaturesPage()}
    </NostalgicLayout>
  );
}
