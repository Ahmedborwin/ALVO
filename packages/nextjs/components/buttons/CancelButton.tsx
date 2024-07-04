function CancelButton({ onClick, text, className }: { onClick: () => void; text?: string; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={
        className ||
        "flex-1 px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-300 ease-in-out"
      }
    >
      {text || "Cancel"}
    </button>
  );
}

export default CancelButton;
