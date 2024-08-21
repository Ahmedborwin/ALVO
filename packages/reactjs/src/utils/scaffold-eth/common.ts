// To be used in JSON.stringify when a field might be bigint
// https://wagmi.sh/react/faq#bigint-serialization
const replacer = (_key: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const isZeroAddress = (address: string) => address === ZERO_ADDRESS;

export { replacer, ZERO_ADDRESS, isZeroAddress };
