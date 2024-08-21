import { useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { useLogout } from "@alchemy/aa-alchemy/react";
import { useDisconnect } from "wagmi";
import { ArrowLeftOnRectangleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useStravaState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();
  const { logout } = useLogout();
  const { clearUserData } = useStravaState(state => state);
  const [IsDropdownOpen, setIsDropdownOpen] = useState(false);
  const handleDisconnect = () => {
    notification.confirm("Are you sure?", () => {
      logout();
      disconnect();
      clearUserData();
    });
  };
  return (
    <div className="relative dropdown-end mr-2">
      <button
        onClick={() => setIsDropdownOpen(!IsDropdownOpen)}
        className="flex items-center space-x-2 bg-red-500 text-white rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <span>Wrong network</span>
        <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
      </button>
      {IsDropdownOpen && (
        <ul className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-10">
          <NetworkOptions />
          <li className="p-1">
            <button
              onClick={handleDisconnect}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 hover:text-red-900"
            >
              <ArrowLeftOnRectangleIcon className="inline-block mr-2 h-5 w-5 text-red-400" />
              Disconnect
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};
export { WrongNetworkDropdown };
