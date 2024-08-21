import { AddressInput as CustomAddressInput } from "../Input";
import Label from "./Label";
import { AddressInputProps } from "~~/types/utils";

function AddressInput({ label, onChange, value, placeholder }: AddressInputProps) {
  return (
    <div>
      <Label label={label} />
      <CustomAddressInput disabled={false} onChange={onChange} value={value} placeholder={placeholder} />
    </div>
  );
}

export default AddressInput;
