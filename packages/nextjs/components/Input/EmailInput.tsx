import { MailSVG, MailSVG2 } from "../svg";
import CustomInput from "./CustomInput";

function EmailInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className="relative">
      <CustomInput
        type="email"
        className={className}
        placeholder="Enter your email"
        value={value}
        onChange={onChange}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{className ? MailSVG2 : MailSVG}</div>
    </div>
  );
}

export default EmailInput;
