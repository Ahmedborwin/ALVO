// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { useAccount as userOperationAccount } from "@alchemy/aa-alchemy/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { SmallChainSVG } from "~~/components/svg";
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
                      type="button"
                      className="
                      px-4 py-2 
                      bg-gradient-to-r from-[#6b429a] to-[#5e40a0] 
                      text-white text-sm font-semibold 
                      rounded-full shadow-lg 
                      hover:from-[#6b429a] hover:to-[#5e40a0] 
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 
                      transform transition-all duration-300 ease-in-out 
                      hover:scale-105 active:scale-95
                    "
                    >
                      <span className="flex items-center justify-center">
                        <span className="mr-1">{SmallChainSVG}</span>
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
