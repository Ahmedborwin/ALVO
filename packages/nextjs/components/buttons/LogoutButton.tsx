"use client";

import { Balance } from "../scaffold-eth";
import { AddressInfoDropdown } from "../scaffold-eth/RainbowKitCustomConnectButton/AddressInfoDropdown";
import { AddressQRCodeModal } from "../scaffold-eth/RainbowKitCustomConnectButton/AddressQRCodeModal";
import { useAccount } from "@alchemy/aa-alchemy/react";
import { Address } from "viem";
import { useEnsName } from "wagmi";
import { accountType, chain } from "~~/config/AlchemyConfig";
import { useNetworkColor } from "~~/hooks/scaffold-eth";

const LogoutButton = () => {
  const networkColor = useNetworkColor();
  const { address } = useAccount({ type: accountType });
  const { data: ensName } = useEnsName({ address });

  return address ? (
    <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-black shadow-md transition-all duration-200">
      <div className="flex flex-col items-center mr-1">
        <Balance address={address as Address} className="min-h-0 h-auto" />
        <span className="text-xs" style={{ color: networkColor }}>
          {chain.name}
        </span>
      </div>
      <AddressInfoDropdown
        address={address}
        displayName={ensName ? String(ensName) : ""}
        ensAvatar={undefined}
        blockExplorerAddressLink={chain.blockExplorers?.default?.url}
      />
      <AddressQRCodeModal address={address as Address} modalId="qrcode-modal" />
    </button>
  ) : (
    ""
  );
};

export default LogoutButton;
