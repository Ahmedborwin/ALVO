function SubmitButton({ onClick, text, className }: { onClick: () => void; text?: string; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={
        className ||
        "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors duration-300 w-full"
      }
    >
      {text || "Submit"}
    </button>
  );
}

export default SubmitButton;
