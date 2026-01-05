export const RequiredMark = () => <span style={{ color: "red" }}>*</span>;

export const HelpText = ({ children }: { children: React.ReactNode }) => (
  <small style={{ color: "#666" }}>{children}</small>
);
