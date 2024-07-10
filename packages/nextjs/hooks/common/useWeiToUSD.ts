import { formatEther } from "viem";
import { useGlobalState } from "~~/services/store/store";

function useWeiToUSD(value = 0n) {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  return Math.trunc(Number(formatEther(BigInt(value))) * nativeCurrencyPrice);
}

export default useWeiToUSD;
