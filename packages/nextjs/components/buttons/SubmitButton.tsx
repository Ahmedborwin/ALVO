function SubmitButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors duration-300 w-full"
      }
    >
      Submit
    </button>
  );
}

export default SubmitButton;
