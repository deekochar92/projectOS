export const formatMoney = (cents: number) => {
  const value = cents / 100;
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(value);
};

export const formatSignedMoney = (cents: number) => {
  const sign = cents < 0 ? "-" : "+";
  return `${sign}${formatMoney(Math.abs(cents))}`;
};
