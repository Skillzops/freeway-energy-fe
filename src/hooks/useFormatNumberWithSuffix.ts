export const formatNumberWithSuffix = (input: number | string) => {
  let num: number;

  if (typeof input === "string") {
    num = parseFloat(input.replace(/,/g, ""));
  } else {
    num = input;
  }

  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(0) + "b+";
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(0) + "m+";
  } else if (num >= 100_000) {
    return (num / 1_000).toFixed(0) + "k+";
  } else {
    return num?.toLocaleString();
  }
};
