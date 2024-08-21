import { useCallback, useEffect, useState } from "react";
import { blo } from "blo";
import { useDebounceValue } from "usehooks-ts";
import { Address, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { CommonInputProps, isENS } from "~~/components/scaffold-eth";

const AddressInput = ({ value, name, placeholder, onChange, disabled }: CommonInputProps<Address | string>) => {
  const [_debouncedValue] = useDebounceValue(value, 500);
  const debouncedValue = isAddress(value) ? value : _debouncedValue;
  const isDebouncedValueLive = debouncedValue === value;
  const settledValue = isDebouncedValueLive ? debouncedValue : undefined;

  const { data: ensAddress, isLoading: isEnsAddressLoading } = useEnsAddress({
    name: settledValue,
    chainId: 1,
    query: { gcTime: 30_000, enabled: isDebouncedValueLive && isENS(debouncedValue) },
  });

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
      onChange(ensAddress);
    }
  }, [ensAddress, onChange, debouncedValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value as Address);
    },
    [onChange],
  );
  const address = value?.slice(0, 6) + "..." + value?.slice(-4);

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
      {isAddress(value) && !isHovered ? (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
          <div className="flex items-center bg-gray-100 rounded-full shadow-sm overflow-hidden">
            {isEnsAvatarLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : ensAvatar ? (
              <img className="w-8 h-8 rounded-full" src={ensAvatar} alt="ENS avatar" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
            )}
            <span className="text-gray-800 font-medium px-3 py-1">
              {isEnsNameLoading || isEnsAddressLoading ? "Loading..." : ensName ? ensName : address}
            </span>
          </div>
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
