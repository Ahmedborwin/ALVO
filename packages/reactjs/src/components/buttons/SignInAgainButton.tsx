import { useLogout } from "@alchemy/aa-alchemy/react";
import { useDisconnect } from "wagmi";
import { useStravaState } from "~~/services/store/store";

function SignInAgainButton() {
  const { disconnect } = useDisconnect();
  const { logout } = useLogout();
  const { clearUserData } = useStravaState(state => state);

  const handleClick = () => {
    disconnect();
    clearUserData();
    logout();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleClick}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition duration-300 ease-in-out"
      >
        Logout
      </button>
    </div>
  );
}

export default SignInAgainButton;
