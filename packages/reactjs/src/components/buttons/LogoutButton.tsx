import { Balance } from "../scaffold-eth";
import { AddressInfoDropdown } from "../scaffold-eth/RainbowKitCustomConnectButton/AddressInfoDropdown";
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
    <>
      <div className="flex flex-col items-center mr-1">
        <Balance address={address as Address} className="min-h-0 h-auto" />
        <span className="text-xs" style={{ color: networkColor }}>
          {chain.name}
        </span>
      </div>
      <AddressInfoDropdown
        address={address as Address}
        displayName={ensName ? String(ensName) : ""}
        ensAvatar={undefined}
        blockExplorerAddressLink={chain.blockExplorers?.default?.url}
      />
    </>
  ) : (
    ""
  );
};

export default LogoutButton;
