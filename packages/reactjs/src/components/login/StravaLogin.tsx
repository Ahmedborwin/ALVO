import { useEffect, useState } from "react";
import { SubmitButton } from "../buttons";
import { MoonSpinner } from "../loader";
import { useAccount as useAlchemyAccount } from "@alchemy/aa-alchemy/react";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { accountType } from "~~/config/AlchemyConfig";
import AxiosInstance from "~~/config/AxiosConfig";
import { STRAVA_AUTH_URL } from "~~/constants";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useStrava } from "~~/hooks/strava";
import { StravaTokenResponse } from "~~/types/utils";
import { notification } from "~~/utils/scaffold-eth";

const StravaLogin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tokenData, setTokenData] = useState<StravaTokenResponse | null>(null);

  const { address } = useAccount();
  const { address: alchemyAddress } = useAlchemyAccount({ type: accountType });
  const { requestToken, callStravaApi, setUserData, getStravaTokens, storeStravaToken } = useStrava();
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("ChainHabits");

  const {
    data: isRegistered,
    error: readRegisteredError,
    isFetched: readRegisteredIsFetched,
    isFetching: readRegisteredIsFetching,
    isError: readRegisteredIsError,
    isPending: readRegisteredIsPending,
    status: readRegisteredStatus,
  } = useScaffoldReadContract({
    contractName: "ChainHabits",
    functionName: "isUserRegisteredTable",
    args: [address ?? alchemyAddress],
  });

  const { data: userDetails } = useScaffoldReadContract({
    contractName: "ChainHabits",
    functionName: "getUserDetails",
    args: [address ?? alchemyAddress],
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get("code");
    const handleTransaction = async () => {
      try {
        setIsLoading(true);
        notification.info("Please make the transaction to register account");
        await writeYourContractAsync({
          functionName: "registerNewUser",
          args: [BigInt(String(tokenData?.athlete?.id)), tokenData?.refresh_token as string],
        });
        await storeStravaToken(authorizationCode as string);
        notification.success("Successfully registered");
      } catch (e) {
        console.error("Error in transaction", e);
      } finally {
        setIsLoading(false);
      }
    };
    if (authorizationCode && tokenData?.athlete?.id) handleTransaction();
  }, [tokenData]);

  useEffect(() => {
    if (!alchemyAddress && !address) return;

    if (
      readRegisteredStatus !== "success" ||
      readRegisteredError !== null ||
      !readRegisteredIsFetched ||
      readRegisteredIsFetching ||
      readRegisteredIsError ||
      readRegisteredIsPending
    )
      return;

    const handleOnLoad = async () => {
      try {
        setIsLoading(true);
        const urlParams = new URLSearchParams(window.location.search);
        if (isRegistered && userDetails?.refreshToken.length) {
          const { data: athleteData } = await callStravaApi(async () => {
            return await AxiosInstance.get("/athlete");
          }, userDetails.refreshToken);
          const data: any = getStravaTokens();
          data["athlete"] = athleteData;
          setUserData(data as StravaTokenResponse);
        } else if (isRegistered === false && urlParams.size > 0) {
          const authorizationCode = urlParams.get("code");
          const rejected = urlParams.get("error");
          if (authorizationCode !== null && rejected === null) {
            const data: any = await requestToken(authorizationCode);
            if (data) setTokenData(data);
          } else if (rejected === "access_denied" && authorizationCode === null) {
            setIsLoading(false);
            toast.remove();
            notification.info("Can't go further without strava access");
          }
        } else if (isRegistered === false) setIsLoading(false);
      } catch (error) {
        notification.error("Something went wrong");
        setIsLoading(false);
        console.error(error);
      }
    };
    handleOnLoad();
  }, [
    requestToken,
    isRegistered,
    readRegisteredStatus,
    readRegisteredError,
    readRegisteredIsFetched,
    readRegisteredIsError,
    readRegisteredIsPending,
    alchemyAddress,
    address,
    setIsLoading,
    setTokenData,
    setUserData,
  ]);

  const connectToStrava = () => {
    window.location.href = STRAVA_AUTH_URL;
  };

  return isLoading ? (
    <MoonSpinner />
  ) : (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 text-center bg-gradient-to-br ">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-4">
        Reach your goals
      </h1>
      <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-thin text-white mb-6 sm:mb-8">
        With Alvo.
      </h3>
      <SubmitButton
        text="Join"
        className="px-8 sm:px-12 py-2 sm:py-3 bg-white text-gray-600 font-semibold rounded-full hover:bg-gray-100 transition duration-300 text-sm sm:text-base"
        onClick={connectToStrava}
      />
    </div>

  );
};

export { StravaLogin };
