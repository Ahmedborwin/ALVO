"use client";

import { Fragment, ReactNode } from "react";
import { MoonSpinner } from "../loader";
import { LogInCard, StravaLogin } from "../login";
import { UserOperationProvider } from "../providers/UserOperationProvider";
import { StwwError } from "../stww";
import { AlchemySignerStatus } from "@alchemy/aa-alchemy";
import { useSignerStatus } from "@alchemy/aa-alchemy/react";
import { useAccount } from "wagmi";
import { useStravaState } from "~~/services/store/store";

function GlobalWrapper({ children }: { children: ReactNode }) {
  const { isInitializing, isConnected, status } = useSignerStatus();
  const { address } = useAccount();

  const stravaData = useStravaState(state => state.getStravaTokens());

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
