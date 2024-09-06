function ToggleCheckBox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center">
      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
        <input
          type="checkbox"
          name={id}
          id={id}
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-400 appearance-none cursor-pointer"
        />
        <label
          htmlFor={id}
          className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-400 cursor-pointer"
        ></label>
      </div>
      <label htmlFor={id} className="text-sm  cursor-pointer">
        {label}
      </label>
    </div>
  );
}

export default ToggleCheckBox;
