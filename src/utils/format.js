export const formatMTZ = (amount) => {
  return `${Number(amount).toLocaleString()} MTZ`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const truncateAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};