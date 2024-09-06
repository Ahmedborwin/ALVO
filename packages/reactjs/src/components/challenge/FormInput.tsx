import { CustomInput } from "../Input";
import Label from "./Label";
import { FormInputProps } from "~~/types/utils";

function FormInput({ label, onChange, value, placeholder, tooltip }: FormInputProps) {
  return (
    <div>
      <Label label={label} tooltip={tooltip} />
      <CustomInput
        className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#61bdfa] text-gray-800 placeholder-gray-500 text-sm"
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        type="text"
      />
    </div>
  );
}

export default FormInput;
