import { PropsWithChildren } from "react";
import { AlchemyAccountProvider, AlchemyAccountsProviderProps } from "@alchemy/aa-alchemy/react";
import { config, queryClient } from "~~/config/AlchemyConfig";

function AlchemyProvider({
  initialState,
  children,
}: PropsWithChildren<{
  initialState?: AlchemyAccountsProviderProps["initialState"];
}>) {
  return (
    <AlchemyAccountProvider config={config} queryClient={queryClient} initialState={initialState}>
      {children}
    </AlchemyAccountProvider>
  );
}

export default AlchemyProvider;
