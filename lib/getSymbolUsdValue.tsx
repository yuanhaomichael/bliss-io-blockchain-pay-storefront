export async function getSymbolUsdValue(symbol: string) {
  const apiKey = process.env.CRYPTO_COMPARE_API_KEY;
  const urlFirst = "https://min-api.cryptocompare.com/data/price?fsym=";
  const urlSecond = "&tsyms=";

  const url = urlFirst + symbol + urlSecond + "USD&api_key=" + apiKey;

  const response = await fetch(url);
  var json = await JSON.parse(await response.text());
  var price = json["USD"];
  if (price === undefined) {
    throw new Error("sol to usd price undefined");
  }
  return await parseFloat(price);
}
