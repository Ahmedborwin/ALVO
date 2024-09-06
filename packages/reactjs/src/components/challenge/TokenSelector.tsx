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
    <div className="space-y-6 ">
      <div className="backdrop-blur-md bg-white bg-opacity-5 rounded-xl shadow-lg border border-white border-opacity-20 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-4">
          <Label label={`Stake Value (${token ? "ERC" : isGBP ? "GBP" : "USD"})`} />
          <div className="flex space-x-4">
            {!token && <ToggleCheckBox id="currency-toggle" label="GBP" checked={isGBP} onChange={setIsGBP} />}
            <ToggleCheckBox id="token-toggle" label="Token" checked={token} onChange={setToken} />
          </div>
        </div>
        {token && (
          <CustomSelect
            className="w-full mb-2 px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#61bdfa] text-gray-800 placeholder-gray-500 text-sm"
            onChange={setSelectedToken}
            value={selectedToken}
            placeholder="Select the token"
            options={options}
          />
        )}
        <CustomInput
          className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#61bdfa] text-gray-800 placeholder-gray-500 text-sm"
          onChange={value => assignValue(value, setStakeValue)}
          value={stakeValue ?? ""}
          placeholder={`Enter stake value (${token ? "ERC" : isGBP ? "GBP" : "USD"})`}
          type="text"
        />
        {!token && (
          <p className="mt-4 text-sm">
            Equivalent: ({isGBP ? "USD" : "GBP"}) {price}
          </p>
        )}
      </div>
    </div>
  );
}

export default TokenSelector;
