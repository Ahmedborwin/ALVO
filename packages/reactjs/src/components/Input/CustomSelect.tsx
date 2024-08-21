import { zeroAddress } from "viem";
import { CustomSelectProps } from "~~/types/utils";

function CustomSelect({ value, onChange, options, placeholder, className }: CustomSelectProps) {
  const handleChange = (selectedValue: string) => {
    onChange(selectedValue);
  };

  return (
    <select
      value={value}
      onChange={e => handleChange(e.target.value)}
      className={
        className ||
        "w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
      }
    >
      <option className="text-black" value={zeroAddress} disabled hidden>
        {placeholder}
      </option>
      {options.map(option => (
        <option className="text-black" key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default CustomSelect;
