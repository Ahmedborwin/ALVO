"use client";

import { SetStateAction, useCallback, useState } from "react";
import { NextPage } from "next";
import { Address, parseEther } from "viem";
import { AddressInput, CustomInput } from "~~/components/Input";
import { CancelButton, SubmitButton } from "~~/components/buttons";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { isValidAddress } from "~~/utils/common";
import { notification } from "~~/utils/scaffold-eth";

const Label = ({ label }: { label: string }) => (
  <label htmlFor={label} className="block text-sm font-medium text-indigo-200 mb-2">
    {label}
  </label>
);

const Challenge: NextPage = () => {
  const [objective, setObjective] = useState<string>("");
  const [charityAddress, setCharityAddress] = useState<string>("");
  const [noOfWeeks, setNoOfWeeks] = useState<number | null>(4);
  const [stakeValue, setStakeValue] = useState<number | null>(40);
  const [startingMiles, setStartingMiles] = useState<number | null>(null);

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("ChainHabits");
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);

  const clearAll = () => {
    setObjective("");
    setCharityAddress("");
    setNoOfWeeks(4);
    setStakeValue(40);
    setStartingMiles(null);
  };

  const handleCreateChallenge = async () => {
    try {
      if (
        objective.length === 0 ||
        noOfWeeks === null ||
        stakeValue === null ||
        startingMiles === null ||
        charityAddress.length !== 42 ||
        !isValidAddress(charityAddress)
      ) {
        notification.info("Please fill all fields");
        return;
      }

      const ethAmount = stakeValue / nativeCurrencyPrice;
      await writeYourContractAsync({
        functionName: "createNewChallenge",
        args: [objective, startingMiles, noOfWeeks, charityAddress as Address],
        value: parseEther(ethAmount.toString()),
      });
    } catch (error) {
      console.error(error);
    }
    clearAll();
  };

  const assignValue = useCallback((value: string, setState: (stateValue: SetStateAction<number | null>) => void) => {
    const data = Number(value);
    if (!value) {
      setState(null);
      return;
    }
    if (!Number.isNaN(data) && data >= 1) setState(data);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
      <div className="m-2 w-full max-w-md mx-4 p-8 backdrop-blur-md bg-white bg-opacity-10 rounded-2xl shadow-2xl border border-white border-opacity-20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Challenge</h2>
        <div className="space-y-6">
          <div>
            <Label label="Objective" />
            <CustomInput
              className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
              onChange={value => setObjective(value)}
              value={objective}
              placeholder="Enter your objective, e.g., 'Will run 1 mile a week'"
              type="text"
            />
          </div>
          <div>
            <Label label="No of weeks" />
            <CustomInput
              className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              onChange={() => {}}
              value={noOfWeeks ?? ""}
              placeholder="Enter no of weeks"
              type="number"
            />
          </div>
          <div>
            <Label label="Starting distance in (Miles)" />
            <CustomInput
              className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
              onChange={value => assignValue(value, setStartingMiles)}
              value={startingMiles ?? ""}
              placeholder="Enter starting distance in miles (e.g., 1 mile)"
              type="number"
            />
          </div>
          <div>
            <Label label="Charity address" />
            <AddressInput
              disabled={false}
              onChange={value => setCharityAddress(value)}
              value={charityAddress}
              placeholder="Enter charity address (e.g., your friend's address)"
            />
          </div>
          <div>
            <Label label="Stake value (USD)" />
            <CustomInput
              className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              onChange={() => {}}
              value={stakeValue ?? ""}
              placeholder="Enter stake value (USD)"
              type="number"
            />
          </div>

          <div className="flex space-x-4">
            <SubmitButton
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition duration-300 ease-in-out"
              onClick={handleCreateChallenge}
            />
            <CancelButton onClick={clearAll} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Challenge;
