import { getSymbolUsdValue } from "./getSymbolUsdValue";

export default async function calculateRewardPoints(
  amountBeforeDiscount,
  discount,
  currency
) {
  const solToUsd = await getSymbolUsdValue("sol");
  const amountAfterDiscount = amountBeforeDiscount - discount;

  if (currency === "sol") {
    const usdVal = amountAfterDiscount * solToUsd;
    // round to the ceiling, eg. 12.3 -> 20 points, 35.2 -> 40 points
    const points = Math.ceil(usdVal / 10) * 10;
    return points;
  } else {
    const usdVal = amountAfterDiscount;
    const points = Math.ceil(usdVal / 10) * 10;
    return points;
  }
}
