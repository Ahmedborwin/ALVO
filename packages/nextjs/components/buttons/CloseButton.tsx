import { CrossSVG } from "../svg";

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 transition duration-300 ease-in-out"
      onClick={onClick}
    >
      {CrossSVG}
    </button>
  );
}

export default CloseButton;
