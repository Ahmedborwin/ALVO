"use client";

import { SetStateAction, useCallback, useState } from "react";
import { NextPage } from "next";
import { parseEther } from "viem";
import { CustomInput } from "~~/components/Input";
import { CancelButton, SubmitButton } from "~~/components/buttons";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

const Label = ({ label }: { label: string }) => (
  <label htmlFor={label} className="block text-sm font-medium text-indigo-200 mb-2">
    {label}
  </label>
);

const Challenge: NextPage = () => {
  const [objective, setObjective] = useState<string>("");
  const [noOfWeeks, setNoOfWeeks] = useState<number | null>(null);
  const [startingMiles, setStartingMiles] = useState<number | null>(null);

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("ChainHabits");
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);

  const clearAll = () => {
    setObjective("");
    setNoOfWeeks(null);
    setStartingMiles(null);
  };

  const handleCreateChallenge = async () => {
    try {
      if (objective.length === 0 || noOfWeeks === null || startingMiles === null) {
        notification.info("Please fill all fields");
        return;
      }
      const amount = 40;
      const ethAmount = amount / nativeCurrencyPrice;
      await writeYourContractAsync({
        functionName: "createNewChallenge",
        args: [objective, startingMiles, noOfWeeks],
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
      <div className="w-full max-w-md mx-4 p-8 backdrop-blur-md bg-white bg-opacity-10 rounded-2xl shadow-2xl border border-white border-opacity-20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Challenge</h2>
        <div className="space-y-6">
          <div>
            <Label label="Objective" />
            <CustomInput
              className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
              onChange={value => setObjective(value)}
              value={objective}
              placeholder="Please enter your objective"
              type="text"
            />
          </div>
          <div>
            <Label label="No of weeks" />
            <CustomInput
              className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
              onChange={value => assignValue(value, setNoOfWeeks)}
              value={noOfWeeks ?? ""}
              placeholder="Please enter no of weeks"
              type="number"
            />
          </div>
          <div>
            <Label label="Starting distance in (Miles)" />
            <CustomInput
              className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
              onChange={value => assignValue(value, setStartingMiles)}
              value={startingMiles ?? ""}
              placeholder="Please enter starting distance in (Miles)"
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
