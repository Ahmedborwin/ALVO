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
        className="
        w-full px-6 py-2.5
        bg-white
        text-[#0b8ee5] text-sm font-medium
        rounded-lg
        shadow-md
        hover:bg-gray-50
        focus:outline-none focus:ring-2 focus:ring-[#61bdfa] focus:ring-opacity-50
        transform transition-all duration-300 ease-in-out
        hover:scale-102 active:scale-98
        border border-[#61bdfa]
        group
      "
      >
        <span className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#61bdfa] group-hover:text-[#0b8ee5] transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </span>
      </button>
    </div>
  );
}

export default SignInAgainButton;
