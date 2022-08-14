import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import calculateAmount from "../../lib/calculateAmount";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { NextApiRequest, NextApiResponse } from "next";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";

export type makeTransactionInputData = {
  customerAccount: string;
  total: number;
  txRef: string;
  currency: string;
};

export type makeTransactionOutputData = {
  transaction: string;
  message: string;
};

type errorOutput = {
  error: string;
};

type getResponse = {
  label: string;
  icon: string;
};

function parseTotal(total: number): BigNumber {
  if (total) {
    return new BigNumber(total);
  } else {
    return new BigNumber(0);
  }
}

// function extractAddr(key: keyof NodeJS.ProcessEnv): string | undefined {
//   const value = process.env[key];
//   return value;
// }

function get(res: NextApiResponse<getResponse>) {
  res.status(200).json({
    label: "Blockshop",
    icon: "https://sol-checkout-demo.s3.amazonaws.com/logo.webp",
  });
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<makeTransactionOutputData | errorOutput>
) {
  try {
    const query = req.query;
    console.log("query,", query);

    let amount = new BigNumber(0);
    let merchantAccount = process.env.MERCHANT_WALLET_ADDR as string;
    let customerAccount = "";
    let txRef = "";
    let currency = "";
    let orderParams = {};
    if (Object.keys(query).length === 0) {
      console.log("browser POST req");
      // parse request for browser requests, whcih have a full req.body
      amount = parseTotal(req.body.total);
      customerAccount = req.body.customerAccount as string;
      txRef = req.body.txRef;
      currency = req.body.currency;
    } else {
      // parse request for mobile wallet requests, which have a req.body with {account: 0x...}
      // must calculateAmount and get currency from params
      console.log("mobile POST req");
      // get payCurrency and reference and orderParams from query params
      for (const [key, value] of Object.entries(query)) {
        if (key === "pay") {
          currency = value as string;
        } else if (key === "ref") {
          txRef = value as string;
        } else {
          orderParams[key] = value;
        }
      }
      // calculate total based on orderParams and currency
      try {
        let { amount: totalUsd, amountSol: totalSol } = await calculateAmount(
          orderParams
        );

        amount =
          currency === "usd" ? parseTotal(totalUsd) : parseTotal(totalSol);
      } catch (e) {
        console.log(e);
      }

      // get customerAccount from req.body
      customerAccount = req.body.account;
    }

    console.log("debug:", {
      query,
      amount,
      merchantAccount,
      customerAccount,
      txRef,
      currency,
      orderParams,
    });

    if (amount.toNumber() === 0) {
      res.status(400).json({ error: "can't checkout with total of 0" });
      return;
    }
    if (!txRef) {
      res.status(400).json({ error: "transaction ref not provided" });
      return;
    }
    if (!customerAccount) {
      res.status(400).json({ error: "no customer account provided" });
      return;
    }
    if (!merchantAccount) {
      res.status(400).json({ error: "no merchant account provided" });
      return;
    }

    const customerAddr = new PublicKey(customerAccount);
    const merchantAddr = new PublicKey(merchantAccount);

    // establish connection to Devnet
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const connection = new Connection(endpoint);
    const { blockhash } = await connection.getLatestBlockhash("confirmed");

    // get usdc addresses and mint
    const usdcAddr = new PublicKey(process.env.USDC_ADDR as string);
    const usdcMint = await getMint(connection, new PublicKey(usdcAddr));
    const customerUsdcAddr = await getAssociatedTokenAddress(
      usdcAddr as PublicKey,
      customerAddr
    );
    const merchantUsdcAddr = await getAssociatedTokenAddress(
      usdcAddr as PublicKey,
      merchantAddr
    );

    // create a Transaction
    const newTx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: customerAddr,
    });

    if (currency === "sol") {
      // create Transaction instruction for sol
      const transferIx = SystemProgram.transfer({
        fromPubkey: customerAddr,
        lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
        toPubkey: merchantAddr,
      });

      // add instruction to Transaction and serialize it
      transferIx.keys.push({
        pubkey: new PublicKey(txRef),
        isSigner: false,
        isWritable: false,
      });

      newTx.add(transferIx);
    } else {
      // Create the instruction to send USDC from the buyer to the shop
      const transferIx = createTransferCheckedInstruction(
        customerUsdcAddr, // source
        usdcAddr, // mint (token address)
        merchantUsdcAddr, // destination
        customerAddr, // owner of source address
        amount.toNumber() * 10 ** (await usdcMint).decimals, // amount to transfer (in units of the USDC token)
        usdcMint.decimals // decimals of the USDC token
      );

      // add instruction to Transaction and serialize it
      transferIx.keys.push({
        pubkey: new PublicKey(txRef),
        isSigner: false,
        isWritable: false,
      });

      newTx.add(transferIx);
    }

    const serializedTx = newTx.serialize({
      requireAllSignatures: false,
    });

    const base64SerializedTx = serializedTx.toString("base64");

    // insert customerAddr, amount, shopId into DB ...

    // return the transaction
    res.status(200).json({
      transaction: base64SerializedTx,
      message: "Thank you for your purchase!",
    });
  } catch (err) {
    res.status(500).json({
      error: "error creating new tx",
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<makeTransactionOutputData | getResponse | errorOutput>
) {
  if (req.method === "GET") {
    return get(res);
  } else if (req.method === "POST") {
    return await post(req, res);
  } else {
    res.status(405).json({ error: "method not allowed" });
  }
}
