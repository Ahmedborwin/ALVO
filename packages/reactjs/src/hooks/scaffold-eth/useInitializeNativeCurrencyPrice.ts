import { useCallback, useEffect } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import axios from "axios";
import { useInterval } from "usehooks-ts";
import scaffoldConfig from "~~/../scaffold.config";
import { ETH_PRICE_GBP_URL } from "~~/constants/common";
import { useGlobalState } from "~~/services/store/store";
import { fetchPriceFromUniswap } from "~~/utils/scaffold-eth";

const enablePolling = true;

/**
 * Get the price of Native Currency based on Native Token/DAI trading pair from Uniswap SDK
 */
const useInitializeNativeCurrencyPrice = () => {
  const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);
  const setIsNativeCurrencyFetching = useGlobalState(state => state.setIsNativeCurrencyFetching);
  const { targetNetwork } = useTargetNetwork();

  const fetchPrice = useCallback(async () => {
    setIsNativeCurrencyFetching(true);
    const price = await fetchPriceFromUniswap(targetNetwork);
    const { data } = await axios.get(ETH_PRICE_GBP_URL);
    setNativeCurrencyPrice(price, data.ethereum.gbp);
    setIsNativeCurrencyFetching(false);
  }, [setIsNativeCurrencyFetching, setNativeCurrencyPrice, targetNetwork]);

  // Get the price of ETH from Uniswap on mount
  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  // Get the price of ETH from Uniswap at a given interval
  useInterval(fetchPrice, enablePolling ? scaffoldConfig.pollingInterval : null);
};
export { useInitializeNativeCurrencyPrice };
