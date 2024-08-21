import { ReactNode, useEffect } from "react";
import { ProfileModal } from "../modal";
import { AlchemyLightAccountClientConfig, AlchemySigner } from "@alchemy/aa-alchemy";
import { useSendUserOperation, useSmartAccountClient } from "@alchemy/aa-alchemy/react";
import { EntryPointRegistryBase, SendUserOperationParameters, SendUserOperationResult } from "@alchemy/aa-core";
import { SmartContractAccount } from "@alchemy/aa-core";
import { UseMutateFunction } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { accountType, chain, gasManagerConfig, accountClientOptions as opts } from "~~/config/AlchemyConfig";
import { notification } from "~~/utils/scaffold-eth";

const TxnNotification = ({ message, blockExplorerLink }: { message: string; blockExplorerLink?: string }) => {
  return (
    <div className={`flex flex-col ml-1 cursor-default`}>
      <p className="my-0">{message}</p>
      {blockExplorerLink && blockExplorerLink.length > 0 ? (
        <a
          href={`${chain.blockExplorers?.default.url}/tx/${blockExplorerLink}`}
          target="_blank"
          rel="noreferrer"
          className="block link text-md"
        >
          check out transaction
        </a>
      ) : null}
    </div>
  );
};

export type SupportedAccounts = AlchemyLightAccountClientConfig<AlchemySigner> & SmartContractAccount;
let handleSentUserOP: UseMutateFunction<
    SendUserOperationResult<keyof EntryPointRegistryBase<unknown>>,
    Error,
    SendUserOperationParameters<SupportedAccounts>,
    unknown
  >,
  getUserOperationResult: SendUserOperationResult | undefined,
  isUserOPPending: boolean,
  isSendUserOperationError: Error | null;
const UserOperationProvider = ({ children }: { children: ReactNode }) => {
  const { client } = useSmartAccountClient({
    type: accountType,
    gasManagerConfig,
    opts,
  });
  const {
    sendUserOperation,
    sendUserOperationResult,
    isSendingUserOperation,
    error: isSendingUserError,
  } = useSendUserOperation({ client, waitForTxn: true });

  useEffect(() => {
    if (sendUserOperationResult) {
      toast.remove();
      notification.success(
        <TxnNotification
          message="Transaction completed successfully!"
          blockExplorerLink={sendUserOperationResult.hash}
        />,
        {
          icon: "🎉",
        },
      );
    }
    if (isSendingUserError) {
      notification.error("Transaction failed error occurred!");
    }
  }, [isSendingUserError, sendUserOperationResult]);

  handleSentUserOP = sendUserOperation;
  getUserOperationResult = sendUserOperationResult;
  isSendUserOperationError = isSendingUserError;
  isUserOPPending = isSendingUserOperation;
  return (
    <span>
      <ProfileModal />
      {children}
    </span>
  );
};
export { UserOperationProvider, handleSentUserOP, getUserOperationResult, isSendUserOperationError, isUserOPPending };
