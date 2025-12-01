import { ReactNode } from "react";

interface ActionSectionProps {
  title: string;
  children: ReactNode;
}

export default function ActionSection({ title, children }: ActionSectionProps) {
  return (
    <div className="nostalgic-section">
      <p>
        <span className="nostalgic-section-title">
          <b>{title}</b>
        </span>
      </p>
      {children}
    </div>
  );
}
