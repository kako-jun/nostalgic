interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  helpText?: string;
}

export default function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
  helpText,
}: SelectFieldProps) {
  return (
    <div className="form-group">
      <label>
        {label}
        {required && <span style={{ color: "red" }}>*</span>}:
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && <small style={{ color: "#666" }}>{helpText}</small>}
    </div>
  );
}
