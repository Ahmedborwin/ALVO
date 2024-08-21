import { useAccount, useSwitchChain } from "wagmi";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import { getNetworkColor } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

type NetworkOptionsProps = {
  hidden?: boolean;
};

const NetworkOptions = ({ hidden = false }: NetworkOptionsProps) => {
  const { switchChain } = useSwitchChain();
  const { chain } = useAccount();

  return (
    <div className="bg-white">
      {allowedNetworks
        .filter(allowedNetwork => allowedNetwork.id !== chain?.id)
        .map(allowedNetwork => (
          <li key={allowedNetwork.id} className={`p-1 ${hidden ? "hidden" : ""}`}>
            <button
              className="flex items-center text-left w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              onClick={() => switchChain?.({ chainId: allowedNetwork.id })}
            >
              <ArrowsRightLeftIcon className="inline-block mr-2 h-5 w-5 text-gray-400" />
              <span>
                Switch to <span style={{ color: getNetworkColor(allowedNetwork, false) }}>{allowedNetwork.name}</span>
              </span>
            </button>
          </li>
        ))}
    </div>
  );
};
export { NetworkOptions };
