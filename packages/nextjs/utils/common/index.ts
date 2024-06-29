const isValidAddress = (address: string) => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false;

  return true;
};

export { isValidAddress };
