import { CustomInput, CustomSelect, ToggleCheckBox } from "../Input";
import Label from "./Label";
import { TokenSelectorProps } from "~~/types/utils";

function TokenSelector({
  token,
  isGBP,
  setIsGBP,
  setToken,
  selectedToken,
  setSelectedToken,
  stakeValue,
  setStakeValue,
  options,
  price,
  assignValue,
}: TokenSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-xl shadow-lg border border-white border-opacity-20 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-4">
          <Label label={`Stake Value (${token ? "ERC" : isGBP ? "GBP" : "USD"})`} />
          <div className="flex space-x-4">
            {!token && <ToggleCheckBox id="currency-toggle" label="GBP" checked={isGBP} onChange={setIsGBP} />}
            <ToggleCheckBox id="token-toggle" label="Token" checked={token} onChange={setToken} />
          </div>
        </div>
        {token && (
          <CustomSelect
            className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200 transition duration-300 ease-in-out"
            onChange={setSelectedToken}
            value={selectedToken}
            placeholder="Select the token"
            options={options}
          />
        )}
        <CustomInput
          className="w-full mt-2 px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200 transition duration-300 ease-in-out"
          onChange={value => assignValue(value, setStakeValue)}
          value={stakeValue ?? ""}
          placeholder={`Enter stake value (${token ? "ERC" : isGBP ? "GBP" : "USD"})`}
          type="text"
        />
        {!token && (
          <p className="mt-4 text-sm text-indigo-200">
            Equivalent: ({isGBP ? "USD" : "GBP"}) {price}
          </p>
        )}
      </div>
    </div>
  );
}

export default TokenSelector;
