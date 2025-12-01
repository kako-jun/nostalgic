interface NostalgicButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  color?: string;
}

export default function NostalgicButton({
  onClick,
  type = "button",
  children,
  color = "#2196F3",
}: NostalgicButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding: "4px 12px",
        backgroundColor: color,
        color: color === "#c0c0c0" ? "#000000" : "white",
        border: `2px outset ${color}`,
        fontSize: color === "#c0c0c0" ? "14px" : "16px",
        fontWeight: "bold",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}
