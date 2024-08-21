import React, { useRef, useState } from "react";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { NetworkOptions } from "./NetworkOptions";
import { useLogout } from "@alchemy/aa-alchemy/react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Address, getAddress } from "viem";
import { useDisconnect } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { BlockieAvatar, isENS } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useStravaState } from "~~/services/store/store";
import { getTargetNetworks, notification } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

const AddressInfoDropdown: React.FC<AddressInfoDropdownProps> = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
}) => {
  const { disconnect } = useDisconnect();
  const { logout } = useLogout();
  const { clearUserData } = useStravaState(state => state);

  const checkSumAddress = getAddress(address);

  const [addressCopied, setAddressCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectingNetwork, setSelectingNetwork] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  const handleCopyAddress = () => {
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 800);
  };

  const handleDisconnect = () => {
    notification.confirm("Are you sure?", () => {
      logout();
      disconnect();
      clearUserData();
    });
  };

  return (
    <div>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <BlockieAvatar address={checkSumAddress} size={30} ensImage={ensAvatar} />
          <span className="ml-2 mr-1">
            {isENS(displayName) ? displayName : `${checkSumAddress.slice(0, 6)}...${checkSumAddress.slice(-4)}`}
          </span>
          <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
        </button>

        {isOpen && (
          <ul className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-10">
            <li className="p-1">
              <CopyToClipboard text={checkSumAddress} onCopy={handleCopyAddress}>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                  {addressCopied ? (
                    <CheckCircleIcon className="inline-block mr-2 h-5 w-5 text-green-500" />
                  ) : (
                    <DocumentDuplicateIcon className="inline-block mr-2 h-5 w-5 text-gray-400" />
                  )}
                  Copy address
                </button>
              </CopyToClipboard>
            </li>
            <AddressQRCodeModal address={address} />
            <li className="p-1">
              <a
                href={blockExplorerAddressLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <ArrowTopRightOnSquareIcon className="inline-block mr-2 h-5 w-5 text-gray-400" />
                View on Block Explorer
              </a>
            </li>
            {allowedNetworks.length > 1 && (
              <li className="p-1">
                <button
                  onClick={() => setSelectingNetwork(true)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <ArrowsRightLeftIcon className="inline-block mr-2 h-5 w-5 text-gray-400" />
                  Switch Network
                </button>
              </li>
            )}
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

        {selectingNetwork && <NetworkOptions />}
      </div>
    </div>
  );
};
export { AddressInfoDropdown };
