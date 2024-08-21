const Label = ({ label, tooltip }: { label: string; tooltip?: string }) => (
  <label htmlFor={label} className="flex items-center text-sm font-medium text-indigo-200 mb-2">
    {label}
    {tooltip ? (
      <span className="ml-2 text-gray-400 cursor-pointer" title={tooltip}>
        ℹ️
      </span>
    ) : (
      ""
    )}
  </label>
);
export default Label;
