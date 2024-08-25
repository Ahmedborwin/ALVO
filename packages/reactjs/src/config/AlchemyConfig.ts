import { AlchemyGasManagerConfig } from "@alchemy/aa-alchemy";
import { SupportedAccountTypes, cookieStorage, createConfig } from "@alchemy/aa-alchemy/config";
import { SmartAccountClientOptsSchema, sepolia } from "@alchemy/aa-core";
import { QueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { VITE_ALCHEMY_GAS_MANAGER_POLICY_ID, rpcUrlSigner, rpcUrlWChain } from "~~/constants";

const chain = sepolia;
const config = createConfig({
  rpcUrl: rpcUrlWChain + chain.id,
  signerConnection: {
    rpcUrl: rpcUrlSigner,
  },
  chain,
  ssr: true,
  storage: cookieStorage,
});

const queryClient = new QueryClient();
const accountType: SupportedAccountTypes = "LightAccount";
const gasManagerConfig: AlchemyGasManagerConfig = {
  policyId: VITE_ALCHEMY_GAS_MANAGER_POLICY_ID,
};
type SmartAccountClienOptions = z.infer<typeof SmartAccountClientOptsSchema>;
const accountClientOptions: Partial<SmartAccountClienOptions> = {
  txMaxRetries: 20,
};

export { chain, config, queryClient, accountType, gasManagerConfig, accountClientOptions };
