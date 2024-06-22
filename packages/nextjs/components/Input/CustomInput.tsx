function CustomInput({
  value,
  onChange,
  type,
  placeholder,
}: {
  value: string | number;
  onChange: (value: string) => void;
  type: string;
  placeholder: string;
}) {
  const handleChange = (value: string) => {
    onChange(value);
  };
  return (
    <input
      type={type}
      value={value}
      onChange={e => handleChange(e.target.value)}
      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
      placeholder={placeholder}
    />
  );
}

export default CustomInput;
