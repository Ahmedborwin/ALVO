import { CancelButton, SubmitButton } from "../buttons";

function ButtonGroup({ handleCreateChallenge, clearAll }: { handleCreateChallenge: () => void; clearAll: () => void }) {
  return (
    <div className="flex space-x-4 pt-4">
      <SubmitButton
        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition duration-300 ease-in-out"
        onClick={handleCreateChallenge}
      />
      <CancelButton onClick={clearAll} />
    </div>
  );
}

export default ButtonGroup;
