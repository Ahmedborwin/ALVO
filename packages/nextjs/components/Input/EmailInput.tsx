import { MailSVG } from "../svg";
import CustomInput from "./CustomInput";

function EmailInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative">
      <CustomInput type="email" placeholder="Enter your email" value={value} onChange={onChange} />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{MailSVG}</div>
    </div>
  );
}

export default EmailInput;
