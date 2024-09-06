function CancelButton({ onClick, text, className }: { onClick: () => void; text?: string; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={
        className ||
        "flex-1 px-4 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold rounded-lg shadow-md hover:from-gray-500 hover:to-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75 transition duration-300 ease-in-out text-sm"
      }
    >
      {text || "Cancel"}
    </button>
  );
}

export default CancelButton;
