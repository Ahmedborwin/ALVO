import { CustomInput } from "../Input";
import Label from "./Label";
import { FormInputProps } from "~~/types/utils";

function FormInput({ label, onChange, value, placeholder, tooltip }: FormInputProps) {
  return (
    <div>
      <Label label={label} tooltip={tooltip} />
      <CustomInput
        className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        type="text"
      />
    </div>
  );
}

export default FormInput;
