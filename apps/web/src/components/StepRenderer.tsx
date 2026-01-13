import StepSection from "./StepSection";
import type { StepConfig } from "../config/commonSteps";

interface FieldValue {
  value: string;
  onChange: (value: string) => void;
}

interface StepRendererProps {
  steps: StepConfig[];
  fieldValues: Record<string, FieldValue>;
  handlers: Record<string, (e: React.FormEvent) => void>;
  responses: Record<string, string>;
  responseTypes?: Record<string, "json" | "text" | "svg">;
  serviceName: string;
}

export default function StepRenderer({
  steps,
  fieldValues,
  handlers,
  responses,
  responseTypes = {},
  serviceName,
}: StepRendererProps) {
  return (
    <>
      {steps.map((step) => (
        <StepSection
          key={step.id}
          config={step}
          fieldValues={fieldValues}
          onSubmit={handlers[step.handlerKey]}
          response={responses[step.responseKey] || ""}
          responseType={step.responseType || responseTypes[step.responseKey] || "json"}
          isCreateStep={step.id === "create"}
          serviceName={serviceName}
        />
      ))}
    </>
  );
}
