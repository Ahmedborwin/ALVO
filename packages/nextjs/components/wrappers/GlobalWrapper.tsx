"use client";

import { Fragment, ReactNode, useEffect } from "react";
import { MoonSpinner } from "../loader";
import { LogInCard, StravaLogin } from "../login";
import { UserOperationProvider } from "../providers/UserOperationProvider";
import { StwwError } from "../stww";
import { AlchemySignerStatus } from "@alchemy/aa-alchemy";
import { useSignerStatus } from "@alchemy/aa-alchemy/react";
import { useAccount } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useCommonState, useStravaState } from "~~/services/store/store";
import { getERCTokenDetails } from "~~/utils/common";
import { notification } from "~~/utils/scaffold-eth";

function GlobalWrapper({ children }: { children: ReactNode }) {
  const { isInitializing, isConnected, status } = useSignerStatus();
  const { address } = useAccount();

  const stravaData = useStravaState(state => state.getStravaTokens());

  const { setERCTokens, setERCTokensInChain, getERCTokens, getERCTokensInChain } = useCommonState(state => state);

  const data = useTargetNetwork();

  useEffect(() => {
    const tokens = getERCTokens();
    const chainTokens = getERCTokensInChain();
    const isTargetChainData = chainTokens?.length
      ? chainTokens[0].chainId.toString().toLowerCase() !== data.targetNetwork.id.toString().toLowerCase()
      : true;
    if (
      (data?.targetNetwork && (!tokens || tokens?.length === 0)) ||
      !chainTokens ||
      chainTokens.length === 0 ||
      isTargetChainData
    ) {
      const setData = async () => {
        try {
          const token = await getERCTokenDetails();
          setERCTokens(token);
          setERCTokensInChain(data.targetNetwork.id);
        } catch (error) {
          notification.error("Error while fetching token details");
          console.error(error);
        }
      };
      setData();
    }
  }, [data?.targetNetwork]);

  if (
    !address &&
    (isInitializing || status === AlchemySignerStatus.INITIALIZING || status === AlchemySignerStatus.AUTHENTICATING)
  )
    return <MoonSpinner />;

  const isAwaitingEmail = status === AlchemySignerStatus.AWAITING_EMAIL_AUTH;

  if (!address && ((!isConnected && status === AlchemySignerStatus.DISCONNECTED) || isAwaitingEmail))
    return <LogInCard isAwaitingEmail={isAwaitingEmail} />;

  if (
    ((address && status === AlchemySignerStatus.DISCONNECTED) ||
      (!address && status === AlchemySignerStatus.CONNECTED)) &&
    (!stravaData.access_token || !stravaData.refresh_token)
  )
    return <StravaLogin />;

  if (
    (address && status === AlchemySignerStatus.DISCONNECTED) ||
    (!address && status === AlchemySignerStatus.CONNECTED)
  )
    return (
      <Fragment>
        <UserOperationProvider>{children}</UserOperationProvider>
      </Fragment>
    );

  if (address && status === AlchemySignerStatus.CONNECTED) return <StwwError />;
}

export default GlobalWrapper;
