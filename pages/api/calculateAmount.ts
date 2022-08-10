import { NextApiRequest, NextApiResponse } from "next";
import { ParsedUrlQuery } from "querystring";
import products from "../../lib/productList";

export type input = {
  params: ParsedUrlQuery
}

export type output = {
  amount: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { params } = req.body;

  let tmp = 0
  for (const [key, quantity] of Object.entries(params)){
    let price = 0
    products.forEach((p) => {
      if(p.id === key){
        price = p.priceUsd
      }
    })
    tmp = tmp + parseInt(quantity as string) * price
  }

  try {
    const solToUsd = await convertToSol();
    const tmpSol = tmp/parseFloat(solToUsd as string)
    if(solToUsd){
      res.status(200).json({amount: tmp, amountSol: Math.round(tmpSol * 1000) / 1000})
    }
  } catch(e) {
    console.error(e)
  }


}

async function convertToSol() {
  const apiKey = process.env.CRYPTO_COMPARE_API_KEY;
  const urlFirst = "https://min-api.cryptocompare.com/data/price?fsym=";
  const urlSecond = "&tsyms=";
  const symbol = 'sol'

  const url = urlFirst + symbol + urlSecond + 'USD&api_key=' + apiKey;

  const response = await fetch(url);
  var json = await JSON.parse(await response.text())
  var price = json["USD"] 
  if(price===undefined){
    throw new Error("sol to usd price undefined")
  }
  return await price
}