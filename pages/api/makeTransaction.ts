import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import calculateAmount from "../../lib/calculateAmount";
import calculateDiscount from "../../lib/calculateDiscount";
import calculateRewardPoints from "../../lib/calculateRewardPoints";
import {
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { NextApiRequest, NextApiResponse } from "next";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import base58 from "bs58";
import putOrCreateRecord from "../../lib/db-ops/putOrCreateRecord";
import {
  shopPointsDecimals,
  MERCHANT,
  USDC,
  BLOCKSHOP_POINTS_ADDR,
  MERCHANT_PRIVATE_KEY,
} from "../../lib/const";
const pointsConversion = shopPointsDecimals === 0 ? 1 : shopPointsDecimals * 10;

export type makeTransactionInputData = {
  customerAccount: string;
  total: number;
  txRef: string;
  currency: string;
};

export type makeTransactionOutputData = {
  transaction: string;
  message: string;
  transactionSummary: object;
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

    let amountBeforeDiscount = 0;
    let merchantAccount = MERCHANT as string;
    let customerAccount = "";
    let txRef = "";
    let currency = "";
    let orderParams = {};
    if (Object.keys(query).length === 0) {
      console.log("browser POST req");
      // parse request for browser requests, whcih have a full req.body
      amountBeforeDiscount = req.body.total;
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

        amountBeforeDiscount = currency === "usd" ? totalUsd : totalSol;
      } catch (e) {
        console.log(e);
      }

      // get customerAccount from req.body
      customerAccount = req.body.account;
    }

    console.log("debug tx info:", {
      query,
      amountBeforeDiscount,
      merchantAccount,
      customerAccount,
      txRef,
      currency,
      orderParams,
    });

    if (amountBeforeDiscount === 0) {
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
    const usdcAddr = new PublicKey(USDC as string);
    const usdcMint = await getMint(connection, new PublicKey(usdcAddr));
    const customerUsdcAddr = await getAssociatedTokenAddress(
      usdcAddr as PublicKey,
      customerAddr
    );
    const merchantUsdcAddr = await getAssociatedTokenAddress(
      usdcAddr as PublicKey,
      merchantAddr
    );

    // get Thank You points balance
    const shopPrivateKey = MERCHANT_PRIVATE_KEY as string;
    if (!shopPrivateKey) {
      res.status(500).json({ error: "no shop private key available " });
    }
    const shopKeyPair = Keypair.fromSecretKey(base58.decode(shopPrivateKey));
    const pointsAddr = new PublicKey(BLOCKSHOP_POINTS_ADDR as string);
    const customerPointsAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      shopKeyPair,
      pointsAddr,
      customerAddr
    ).then((account) => account.address);
    const merchantPointsAccount = await getAssociatedTokenAddress(
      pointsAddr,
      merchantAddr
    );
    const { amount: customerPointsBalanceRaw } = await getAccount(
      connection,
      customerPointsAccount
    );
    const customerPointsBalance = Math.floor(
      parseInt(customerPointsBalanceRaw.toLocaleString()) / pointsConversion
    );
    console.log("debug loyalty system:", {
      customerPointsAccount,
      merchantPointsAccount,
      customerPointsBalance,
    });

    // get which NFT badges is available in the customer account
    const badges = [];

    // calculate discount and rewards, update final amount
    let { discount, pointsToBurn, nftsToBurn } = await calculateDiscount(
      amountBeforeDiscount,
      customerPointsBalance,
      badges,
      currency
    );
    console.log("debug discounts:", {
      discount,
      pointsToBurn,
      nftsToBurn,
      amountBeforeDiscount,
    });
    const tmp = amountBeforeDiscount - discount;
    const amount = parseTotal(
      currency === "usd"
        ? Math.round(tmp * 100) / 100
        : Math.round(tmp * 10000) / 10000
    );
    console.log("final amount is", amount.toNumber());

    // create a Transaction
    const newTx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: customerAddr,
    });

    // shop recycling users' Thank you points from user's account (sending to merchant account)
    const burnIx = createTransferCheckedInstruction(
      customerPointsAccount,
      pointsAddr,
      merchantPointsAccount,
      customerAddr,
      pointsToBurn * pointsConversion,
      1
    );

    // shop issuing Thank You points back to customer
    const rewardPoints = await calculateRewardPoints(
      amountBeforeDiscount,
      discount,
      currency
    );
    console.log("reward points", rewardPoints);

    const rewardIx = createTransferCheckedInstruction(
      merchantPointsAccount,
      pointsAddr,
      customerPointsAccount,
      merchantAddr,
      rewardPoints * pointsConversion,
      1
    );
    rewardIx.keys.push({
      pubkey: merchantAddr,
      isSigner: true,
      isWritable: false,
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

      newTx.add(transferIx, burnIx, rewardIx);
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

      newTx.add(transferIx, burnIx, rewardIx);
    }

    // must partially sign the tx so that shop can auto send the points to customer (as discount)
    newTx.partialSign(shopKeyPair);

    const serializedTx = newTx.serialize({
      requireAllSignatures: false,
    });

    const base64SerializedTx = serializedTx.toString("base64");

    // insert customerAddr, amount, shopId into DB ...
    const transactionSummary = {
      walletAddr: customerAccount,
      merchantWalletAddr: merchantAccount,
      amountBeforeDiscount,
      discount,
      finalAmount: amount.toNumber(),
      pointsToBurn,
      rewardPoints,
      txRef,
      currency,
      timeStamp: Date.now().toString(),
    };
    try {
      await putOrCreateRecord("transactions", transactionSummary);
    } catch (e) {
      console.error(e);
    }

    // return the transaction
    res.status(200).json({
      transaction: base64SerializedTx,
      message: "thanks for shopping with us!",
      transactionSummary,
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
