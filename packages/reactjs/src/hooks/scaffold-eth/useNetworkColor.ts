import { useTargetNetwork } from "./useTargetNetwork";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

const DEFAULT_NETWORK_COLOR: [string, string] = ["#666666", "#bbbbbb"];

function getNetworkColor(network: ChainWithAttributes, isDarkMode: boolean) {
  const colorConfig = network.color ?? DEFAULT_NETWORK_COLOR;
  return Array.isArray(colorConfig) ? (isDarkMode ? colorConfig[1] : colorConfig[0]) : colorConfig;
}

/**
 * Gets the color of the target network
 */
const useNetworkColor = () => {
  const { targetNetwork } = useTargetNetwork();

  return getNetworkColor(targetNetwork, false);
};

export { DEFAULT_NETWORK_COLOR, getNetworkColor, useNetworkColor };
