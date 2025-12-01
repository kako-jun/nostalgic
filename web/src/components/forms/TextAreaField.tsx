interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  helpText?: string;
}

export default function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
  helpText,
}: TextAreaFieldProps) {
  return (
    <div className="form-group">
      <label>
        {label}
        {required && <span style={{ color: "red" }}>*</span>}:
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
      {helpText && <small style={{ color: "#666" }}>{helpText}</small>}
    </div>
  );
}
