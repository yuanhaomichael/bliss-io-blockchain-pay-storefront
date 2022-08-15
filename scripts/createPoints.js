import {
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  mintToChecked,
} from "@solana/spl-token";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import base58 from "bs58";

const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);
const connection = new Connection(endpoint);

const shopPrivateKey = process.env.MERCHANT_PRIVATE_KEY;

if (!shopPrivateKey) {
  console.log("did not get shop private key");
}
const shopAccount = Keypair.fromSecretKey(base58.decode(shopPrivateKey));

console.log("creating token...");

const myPointAddr = await createMint(
  connection,
  shopAccount,
  shopAccount.publicKey,
  shopAccount.publicKey,
  1
);

console.log("token is:", myPointAddr.toString());

console.log("token account creation...");

const shopPointAddr = await createAssociatedTokenAccount(
  connection,
  shopAccount,
  myPointAddr,
  shopAccount.publicKey
);

console.log("minting 1 mill points");

await mintToChecked(
  connection,
  shopAccount,
  myPointAddr,
  shopPointAddr,
  shopAccount,
  1_000_000,
  1
);
console.log("minted");

const { amount } = await getAccount(connection, shopPointAddr);

console.log({
  pointTokenAddr: myPointAddr.toString(),
  balance: amount.toLocaleString(),
});
