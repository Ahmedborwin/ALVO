import { useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { useAccount as userOperationAccount } from "@alchemy/aa-alchemy/react";
import { MutateOptions } from "@tanstack/react-query";
import { Abi, ExtractAbiFunctionNames } from "abitype";
import { encodeFunctionData } from "viem";
import { Config, UseWriteContractParameters, useAccount, useWriteContract } from "wagmi";
import { WriteContractErrorType, WriteContractReturnType } from "wagmi/actions";
import { WriteContractVariables } from "wagmi/query";
import { handleSentUserOP } from "~~/components/providers/UserOperationProvider";
import { chain as accountChain, accountType } from "~~/config/AlchemyConfig";
import ERC20_ABI from "~~/constants/contractDetails/ERC20ABI";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import {
  ContractAbi,
  ContractName,
  ScaffoldWriteContractOptions,
  ScaffoldWriteContractVariables,
  ScaffoldWriteContractVariablesWithApprove,
} from "~~/utils/scaffold-eth/contract";

/**
 * Wrapper around wagmi's useWriteContract hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param contractName - name of the contract to be written to
 * @param writeContractParams - wagmi's useWriteContract parameters
 */
/**
 * Custom notification content for TXs.
 */

export const useScaffoldWriteContract = <TContractName extends ContractName>(
  contractName: TContractName,
  writeContractParams?: UseWriteContractParameters,
) => {
  const { chain, address } = useAccount();
  const { address: accountAddress } = userOperationAccount({ type: accountType });

  const writeTx = useTransactor();
  const [isMining, setIsMining] = useState(false);
  const { targetNetwork } = useTargetNetwork();

  const wagmiContractWrite = useWriteContract(writeContractParams);

  const { data: deployedContractData } = useDeployedContractInfo(contractName);

  const sendContractWriteAsyncTx = async <TContractName extends ContractName>(
    variables: ScaffoldWriteContractVariablesWithApprove<TContractName>,
    options?: ScaffoldWriteContractOptions,
    targetERCAddress?: string,
  ) => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }

    if (!chain?.id && !address && !accountAddress && !accountChain?.id) {
      notification.error("Please connect your wallet or embedded account");
      return;
    }

    if ((address && chain?.id !== targetNetwork.id) || (accountAddress && accountChain?.id !== targetNetwork.id)) {
      notification.error("You are on the wrong network");
      return;
    }

    try {
      setIsMining(true);
      if (!address && accountAddress) {
        const args: any = variables?.args ?? [];
        const data = encodeFunctionData({
          abi: deployedContractData.abi as any,
          functionName: variables.functionName,
          args: args,
        });

        handleSentUserOP({
          uo: {
            target: deployedContractData.address,
            data: data,
            value: variables?.value,
          },
        });
        notification.loading("Waiting for transaction to complete.");
        return;
      } else if (address && !accountAddress) {
        const { blockConfirmations, onBlockConfirmation, ...mutateOptions } = options || {};
        const makeWriteWithParams = () =>
          wagmiContractWrite.writeContractAsync(
            {
              abi: targetERCAddress ? (ERC20_ABI as Abi) : (deployedContractData.abi as Abi),
              address: targetERCAddress || deployedContractData.address,
              ...variables,
            } as WriteContractVariables<Abi, string, any[], Config, number>,
            mutateOptions as
              | MutateOptions<
                  WriteContractReturnType,
                  WriteContractErrorType,
                  WriteContractVariables<Abi, string, any[], Config, number>,
                  unknown
                >
              | undefined,
          );
        const writeTxResult = await writeTx(makeWriteWithParams, { blockConfirmations, onBlockConfirmation });

        return writeTxResult;
      }
    } catch (e: any) {
      throw e;
    } finally {
      setIsMining(false);
    }
  };

  const sendContractWriteTx = <
    TContractName extends ContractName,
    TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "nonpayable" | "payable">,
  >(
    variables: ScaffoldWriteContractVariables<TContractName, TFunctionName>,
    options?: Omit<ScaffoldWriteContractOptions, "onBlockConfirmation" | "blockConfirmations">,
    targetERCAddress?: string,
  ) => {
    if (!deployedContractData) {
      notification.error("Target Contract is not deployed, did you forget to run `yarn deploy`?");
      return;
    }
    if (!chain?.id) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== targetNetwork.id) {
      notification.error("You are on the wrong network");
      return;
    }

    wagmiContractWrite.writeContract(
      {
        abi: targetERCAddress ? (ERC20_ABI as Abi) : (deployedContractData.abi as Abi),
        address: targetERCAddress || deployedContractData.address,
        ...variables,
      } as WriteContractVariables<Abi, string, any[], Config, number>,
      options as
        | MutateOptions<
            WriteContractReturnType,
            WriteContractErrorType,
            WriteContractVariables<Abi, string, any[], Config, number>,
            unknown
          >
        | undefined,
    );
  };

  return {
    ...wagmiContractWrite,
    isMining,
    // Overwrite wagmi's writeContactAsync
    writeContractAsync: sendContractWriteAsyncTx,
    // Overwrite wagmi's writeContract
    writeContract: sendContractWriteTx,
  };
};
