export type ButtonVariant = "primary" | "warning" | "danger" | "secondary";

const BUTTON_COLORS: Record<ButtonVariant, string> = {
  primary: "#2196F3",
  warning: "#FF9800",
  danger: "#F44336",
  secondary: "#c0c0c0",
};

interface NostalgicButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  variant?: ButtonVariant;
}

export default function NostalgicButton({
  onClick,
  type = "button",
  children,
  variant = "primary",
}: NostalgicButtonProps) {
  const color = BUTTON_COLORS[variant];
  const isSecondary = variant === "secondary";

  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding: "4px 12px",
        backgroundColor: color,
        color: isSecondary ? "#000000" : "white",
        border: `2px outset ${color}`,
        fontSize: isSecondary ? "14px" : "16px",
        fontWeight: "bold",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}
