import { encodeURL, TransferRequestURLFields } from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";

export default function generateSolPayTransferUrl(
  amount: number,
  type: string,
  reference: PublicKey
) {
  // const merchant = new PublicKey(process.env.MERCHANT_WALLET_ADDR as string)
  // const usdc = new PublicKey(process.env.USDC_ADDR as string)
  const merchant = new PublicKey(
    "DknJQ9k5dfA54QwLoiACyB1vPpCTHBXbecHajvyLacvw"
  );
  const usdc = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

  const urlParams: TransferRequestURLFields = {
    recipient: merchant,
    splToken: type === "usd" ? usdc : undefined,
    amount: new BigNumber(amount),
    reference,
    label: "Blockshop",
    message: `order ref: ${reference}, amount ${amount} in ${type}`,
  };
  const url = encodeURL(urlParams);
  return url;
}
