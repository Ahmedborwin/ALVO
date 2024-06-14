import { AlchemyGasManagerConfig } from "@alchemy/aa-alchemy";
import { SupportedAccountTypes, cookieStorage, createConfig } from "@alchemy/aa-alchemy/config";
import { SmartAccountClientOptsSchema, sepolia } from "@alchemy/aa-core";
import { QueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ALCHEMY_GAS_MANAGER_POLICY_ID, rpcUrl, rpcUrlWChain } from "~~/constants";

export const chain = sepolia;
export const config = createConfig({
  rpcUrl: rpcUrlWChain + chain.id,
  signerConnection: {
    rpcUrl,
  },
  chain,
  ssr: true,
  storage: cookieStorage,
});

export const queryClient = new QueryClient();
export const accountType: SupportedAccountTypes = "LightAccount";
export const gasManagerConfig: AlchemyGasManagerConfig = {
  policyId: ALCHEMY_GAS_MANAGER_POLICY_ID,
};
type SmartAccountClienOptions = z.infer<typeof SmartAccountClientOptsSchema>;
export const accountClientOptions: Partial<SmartAccountClienOptions> = {
  txMaxRetries: 20,
};
