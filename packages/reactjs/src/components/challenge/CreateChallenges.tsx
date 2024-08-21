import { SetStateAction, useCallback } from "react";
import AddressInput from "./AddressInput";
import ButtonGroup from "./ButtonGroup";
import FormInput from "./FormInput";
import TokenSelector from "./TokenSelector";
import { useAllowedTokenOptions } from "~~/hooks/common";
import { CreateChallengesProps, Option } from "~~/types/utils";

function CreateChallenges({
  // State Values
  objective,
  noOfWeeks,
  startingMiles,
  targetIncrease,
  forfeitAddress,
  token,
  isGBP,
  selectedToken,
  stakeValue,
  price,

  // Setters
  setObjective,
  setNoOfWeeks,
  setStartingMiles,
  setTargetIncrease,
  setForfeitAddress,
  setToken,
  setIsGBP,
  setSelectedToken,
  setStakeValue,

  // Action Handlers
  handleCreateChallenge,
  clearAll,
}: CreateChallengesProps) {
  const options: Option[] = useAllowedTokenOptions();

  const assignValue = useCallback((value: string, setState: (stateValue: SetStateAction<number | null>) => void) => {
    const data = Number(value);
    if (!value) {
      setState(null);
      return;
    }
    if (!Number.isNaN(data) && data >= 1) setState(parseInt(data.toString()));
  }, []);

  const assignPercentage = useCallback((value: string): void => {
    const castValue = Number(value);
    if (!castValue || Number.isNaN(castValue)) {
      setTargetIncrease(0);
      return;
    }
    if (castValue < 0 || castValue > 100) return;
    setTargetIncrease(castValue);
  }, []);

  return (
    <div className="max-w-md mx-auto">
      <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-3xl shadow-2xl border border-white border-opacity-20 p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Create Challenge</h2>
        <div className="space-y-6">
          <FormInput
            label="Objective"
            onChange={value => {
              if (value.length < 100) setObjective(value);
            }}
            value={objective}
            placeholder="What is Your Objective? e.g. Run Marathon"
          />
          <FormInput
            label="No of weeks"
            onChange={value => assignValue(value, setNoOfWeeks)}
            value={noOfWeeks ?? ""}
            placeholder="What is Your Training Period?"
          />
          <FormInput
            label="Target distance (Miles)"
            onChange={value => assignValue(value, setStartingMiles)}
            value={startingMiles ?? ""}
            placeholder="Target weekly distance in miles (e.g. 10 miles)"
          />
          <FormInput
            label="Target Increase %"
            onChange={value => assignPercentage(value)}
            value={targetIncrease ?? ""}
            placeholder="Weekly target increase percentage (e.g. 5)"
            tooltip="If set to more than 0, the weekly target will increase by this percentage every week"
          />
          <AddressInput
            label="Forfeit Address"
            onChange={value => setForfeitAddress(value)}
            value={forfeitAddress}
            placeholder="Address funds will go to (e.g., charity)"
          />
          <TokenSelector
            token={token}
            isGBP={isGBP}
            stakeValue={stakeValue}
            selectedToken={selectedToken}
            options={options}
            price={price}
            setToken={setToken}
            setIsGBP={setIsGBP}
            setSelectedToken={setSelectedToken}
            setStakeValue={setStakeValue}
            assignValue={assignValue}
          />
          <ButtonGroup clearAll={clearAll} handleCreateChallenge={handleCreateChallenge} />
        </div>
      </div>
    </div>
  );
}

export default CreateChallenges;
