interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}

export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  helpText,
}: FormFieldProps) {
  return (
    <div className="form-group">
      <label>
        {label}
        {required && <span style={{ color: "red" }}>*</span>}:
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
      {helpText && <small style={{ color: "#666" }}>{helpText}</small>}
    </div>
  );
}
