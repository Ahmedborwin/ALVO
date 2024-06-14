import { useLogout } from "@alchemy/aa-alchemy/react";
import { useDisconnect } from "wagmi";

function SignInAgainButton() {
  const { disconnect } = useDisconnect();
  const { logout } = useLogout();

  const handleClick = () => {
    disconnect();
    logout();
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 text-white font-bold bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      Sign in Again
    </button>
  );
}

export default SignInAgainButton;
