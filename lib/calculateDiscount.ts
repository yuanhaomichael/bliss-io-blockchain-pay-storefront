import { getSymbolUsdValue } from "./getSymbolUsdValue"
import { usdToPoints } from "./const"

// use checkout amount before discount and points balance and NFT badges to calculate total discount
export default async function calculateDiscount(amountBeforeDiscount, balance, badges, currency): Promise<any> {
  let discount = 0
  let pointsToBurn = 0 
  let nftsToBurn = []
  const solToUsd = await getSymbolUsdValue('sol')
  let amountBeforeDiscountUsd = currency === "sol" ? amountBeforeDiscount * solToUsd : amountBeforeDiscount

  // calculate points and nft discount in usd
  const pointsDiscount = await calculatePointsDiscount(balance)
  const nftsDiscount = await calculateNftsDiscount(badges)

  if (pointsDiscount + nftsDiscount > amountBeforeDiscountUsd){
    // if total discount greater than checkout amount, use up the points first, and check which nfts to burn
    if (pointsDiscount > amountBeforeDiscountUsd){
      // only use points
      discount = amountBeforeDiscountUsd
      pointsToBurn = amountBeforeDiscountUsd * 100
    }
    else{
      // use both points and nfts, points first
      pointsToBurn = balance
      const nftPayAmount = amountBeforeDiscountUsd - pointsDiscount
      nftsToBurn = await checkNftsToBurn(nftPayAmount, badges)
      discount = amountBeforeDiscountUsd
    }
    
  } 
  else {
    // total discount less than checkout amount, burn all avail points and nfts
    discount = pointsDiscount + nftsDiscount
    pointsToBurn = balance
    nftsToBurn = await checkNftsToBurn(nftsDiscount, badges)
  }


  if(currency === 'sol'){
    discount = Math.round(discount * 1000 / solToUsd)/1000
  }
  return {discount, pointsToBurn, nftsToBurn}
}

async function calculatePointsDiscount(balance) {
  return Math.round(balance / usdToPoints)
}


async function calculateNftsDiscount(badges){
  return 0
}

async function checkNftsToBurn(nftPayAmount, badges) {
  return []
}