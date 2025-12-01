import { ReactNode } from "react";

interface UsageStepProps {
  stepNumber: number;
  title: string;
  children: ReactNode;
}

export default function UsageStep({ stepNumber, title, children }: UsageStepProps) {
  return (
    <div className="nostalgic-section">
      <p>
        <span className="nostalgic-section-title">
          <b>
            ◆STEP {stepNumber}: {title}◆
          </b>
        </span>
      </p>
      {children}
    </div>
  );
}
