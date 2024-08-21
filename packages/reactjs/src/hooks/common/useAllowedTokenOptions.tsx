import { useMemo } from "react";
import { useCommonState } from "~~/services/store/store";
import { ERCTokens, Option } from "~~/types/utils";

function useAllowedTokenOptions() {
  const chainTokenDetails = useCommonState(state => state.getERCTokensInChain());
  const allowedTokens: { [key: string]: string } = {
    USDC: "USDC",
  };
  const options: Option[] = useMemo(() => {
    return chainTokenDetails.reduce((prev: Option[], { name, address }: ERCTokens) => {
      if (allowedTokens[name] === name) {
        prev.push({
          value: address,
          label: name,
        });
      }
      return prev;
    }, []);
  }, [chainTokenDetails]);
  return options;
}

export default useAllowedTokenOptions;
