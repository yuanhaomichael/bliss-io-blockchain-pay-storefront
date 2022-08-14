import products from "./productList";
import { getSymbolUsdValue } from "./getSymbolUsdValue";

interface returnInterface {
  amount: number | undefined;
  amountSol: number | undefined;
}

export default async function calculateAmount(params: object): Promise<any> {
  let tmp = 0;
  for (const [key, quantity] of Object.entries(params)) {
    let price = 0;
    products.forEach((p) => {
      if (p.id === key) {
        price = p.priceUsd;
      }
    });
    tmp = tmp + parseInt(quantity as string) * price;
  }

  try {
    const solToUsd = await getSymbolUsdValue("sol");
    const tmpSol = tmp / solToUsd;
    const amount = tmp;
    const amountSol = Math.round(tmpSol * 1000) / 1000;
    return { amount, amountSol };
  } catch (e) {
    console.error(e);
  }
  return { amount: 0, amountSol: 0 };
}
