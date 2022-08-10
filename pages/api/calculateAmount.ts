import { NextApiRequest, NextApiResponse } from "next";
import { ParsedUrlQuery } from "querystring";
import products from "../../lib/productList";
import { getSymbolUsdValue } from "../../lib/getSymbolUsdValue";

export type input = {
  params: ParsedUrlQuery;
};

export type output = {
  amount: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { params } = req.body;

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
    if (solToUsd) {
      res
        .status(200)
        .json({ amount: tmp, amountSol: Math.round(tmpSol * 1000) / 1000 });
    }
  } catch (e) {
    console.error(e);
  }
}
