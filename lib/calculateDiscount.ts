import { getSymbolUsdValue } from "./getSymbolUsdValue"

export default async function calculateDiscount(amountBeforeDiscount, balance, badges, currency): Promise<any> {
  let discount = 0
  let pointsToBurn = 0 
  let nftsToBurn = []

  // calculate points and nft discount in usd
  const pointsDiscount = await calculatePointsDiscount(balance)
  const nftsDiscount = await calculateNftsDiscount(badges)

  if (pointsDiscount + nftsDiscount > amountBeforeDiscount){
    // if total discount greater than checkout amount, use up the points first, and check which nfts to burn
    if (pointsDiscount > amountBeforeDiscount){
      // only use points
      discount = amountBeforeDiscount
      pointsToBurn = amountBeforeDiscount * 100
    }
    else{
      // use both points and nfts, points first
      pointsToBurn = balance
      const nftPayAmount = amountBeforeDiscount - pointsDiscount
      nftsToBurn = await checkNftsToBurn(nftPayAmount, badges)
      discount = amountBeforeDiscount
    }
    
  } 
  else {
    // total discount less than checkout amount, burn all avail points and nfts
    discount = pointsDiscount + nftsDiscount
    pointsToBurn = balance
    nftsToBurn = await checkNftsToBurn(nftsDiscount, badges)
  }


  if(currency === 'sol'){
    const solToUsd = await getSymbolUsdValue('sol')
    discount = Math.round(discount * 1000 / solToUsd)/1000
  }
  return {discount, pointsToBurn, nftsToBurn}
}

async function calculatePointsDiscount(balance) {
  return Math.round(balance*100 / 100)/100
}


async function calculateNftsDiscount(badges){
  return 0
}

async function checkNftsToBurn(nftPayAmount, badges) {
  return []
}