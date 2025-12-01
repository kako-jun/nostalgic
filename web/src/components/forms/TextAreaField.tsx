import { RequiredMark, HelpText } from "../common/FormHelpers";

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
        {required && <RequiredMark />}:
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
      {helpText && <HelpText>{helpText}</HelpText>}
    </div>
  );
}
