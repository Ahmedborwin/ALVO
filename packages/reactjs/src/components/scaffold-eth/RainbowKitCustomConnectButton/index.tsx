// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { useAccount as userOperationAccount } from "@alchemy/aa-alchemy/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { LightningSVG } from "~~/components/svg";
import { accountType } from "~~/config/AlchemyConfig";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

const RainbowKitCustomConnectButton = () => {
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();
  const { address } = useAccount();
  const { address: embeddedAccount } = userOperationAccount({ type: accountType });
  return (
    <button
      className={
        !address && !embeddedAccount
          ? ""
          : `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-black shadow-md transition-all duration-200`
      }
    >
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, mounted }) => {
          const connected = mounted && account && chain;
          const blockExplorerAddressLink = account
            ? getBlockExplorerAddressLink(targetNetwork, account.address)
            : undefined;

          return (
            <>
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
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

                        {LightningSVG}
                        Connect Wallet
                      </span>
                    </button>
                  );
                }

                if (chain.unsupported || chain.id !== targetNetwork.id) {
                  return <WrongNetworkDropdown />;
                }

                return (
                  <>
                    <div className="flex flex-col items-center mr-1">
                      <Balance address={account.address as Address} className="min-h-0 h-auto" />
                      <span className="text-xs" style={{ color: networkColor }}>
                        {chain.name}
                      </span>
                    </div>
                    <AddressInfoDropdown
                      address={account.address as Address}
                      displayName={account.displayName}
                      ensAvatar={account.ensAvatar}
                      blockExplorerAddressLink={blockExplorerAddressLink}
                    />
                  </>
                );
              })()}
            </>
          );
        }}
      </ConnectButton.Custom>
    </button>
  );
};

export { RainbowKitCustomConnectButton };
