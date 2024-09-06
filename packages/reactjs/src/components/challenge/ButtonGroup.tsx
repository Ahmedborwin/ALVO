import { CancelButton, SubmitButton } from "../buttons";

function ButtonGroup({ handleCreateChallenge, clearAll }: { handleCreateChallenge: () => void; clearAll: () => void }) {
  return (
    <div className="flex space-x-4 pt-4">
      <SubmitButton
        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0b8ee5] to-[#61bdfa] text-white font-semibold rounded-lg shadow-md hover:from-[#61bdfa] hover:to-[#0b8ee5] focus:outline-none focus:ring-2 focus:ring-[#3aa7f5] focus:ring-opacity-75 transition duration-1000 ease-in-out text-sm"
        onClick={handleCreateChallenge}
      />
      <CancelButton onClick={clearAll} />
    </div>
  );
}

export default ButtonGroup;
