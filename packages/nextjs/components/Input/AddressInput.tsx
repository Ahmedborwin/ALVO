import { useCallback, useEffect, useState } from "react";
import { blo } from "blo";
import { useDebounceValue } from "usehooks-ts";
import { Address, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { CommonInputProps, isENS } from "~~/components/scaffold-eth";

export const AddressInput = ({ value, name, placeholder, onChange, disabled }: CommonInputProps<Address | string>) => {
  const [_debouncedValue] = useDebounceValue(value, 500);
  const debouncedValue = isAddress(value) ? value : _debouncedValue;
  const isDebouncedValueLive = debouncedValue === value;
  const settledValue = isDebouncedValueLive ? debouncedValue : undefined;

  const { data: ensAddress, isLoading: isEnsAddressLoading } = useEnsAddress({
    name: settledValue,
    chainId: 1,
    query: { gcTime: 30_000, enabled: isDebouncedValueLive && isENS(debouncedValue) },
  });

  const [enteredEnsName, setEnteredEnsName] = useState<string>();
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { data: ensName, isLoading: isEnsNameLoading } = useEnsName({
    address: settledValue as Address,
    chainId: 1,
    query: { enabled: isAddress(debouncedValue), gcTime: 30_000 },
  });

  const { data: ensAvatar, isLoading: isEnsAvatarLoading } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: 1,
    query: { enabled: Boolean(ensName), gcTime: 30_000 },
  });

  useEffect(() => {
    if (ensAddress) {
      setEnteredEnsName(debouncedValue);
      onChange(ensAddress);
    }
  }, [ensAddress, onChange, debouncedValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEnteredEnsName(undefined);
      onChange(e.target.value as Address);
    },
    [onChange],
  );

  return (
    <div className="relative">
      <input
        type="text"
        name={name}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        placeholder={placeholder}
        value={value as string}
        onChange={handleChange}
        disabled={isEnsAddressLoading || isEnsNameLoading || disabled}
        className={`w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200 ${
          ensAddress === null ? "border-red-500" : ""
        }`}
      />
      {(ensName || isEnsNameLoading || isEnsAddressLoading) && !isHovered ? (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center bg-base-300 rounded-full">
          {isEnsAvatarLoading && <div className="w-[35px] h-[35px] rounded-full bg-base-200 animate-pulse"></div>}
          {ensAvatar && <img className="w-[35px] h-[35px] rounded-full" src={ensAvatar} alt={`${ensAddress} avatar`} />}
          <span className="text-accent px-2">
            {enteredEnsName ?? ensName ?? (isEnsNameLoading || isEnsAddressLoading ? "Loading..." : "")}
          </span>
        </div>
      ) : (
        ""
      )}
      {value && (
        <img
          alt=""
          className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
          src={blo(value as `0x${string}`)}
          width="35"
          height="35"
        />
      )}
    </div>
  );
};

export default AddressInput;
