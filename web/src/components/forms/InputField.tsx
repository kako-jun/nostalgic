interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "url" | "number";
  placeholder?: string;
  required?: boolean;
  width?: string;
}

export default function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  width = "60%",
}: InputFieldProps) {
  return (
    <p>
      <b>{label}：</b>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        style={{
          width,
          padding: "4px",
          border: "1px solid #666",
          fontFamily: "inherit",
          fontSize: "16px",
        }}
        required={required}
      />
    </p>
  );
}
