import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { NextApiRequest, NextApiResponse } from "next";
import { clusterApiUrl, Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import BigNumber from "bignumber.js";

export type makeTransactionInputData = {
  customerAccount: string,
  total: number,
  txRef: string
}

export type makeTransactionOutputData = {
  transaction: string,
  message: string,
}

type errorOutput = {
  error: string
}

function parseTotal (total: number): BigNumber {
  if (total) {
    return new BigNumber(total); 
  }
  else {
    return new BigNumber(0);
  } 
} 

function extractAddr(key: keyof NodeJS.ProcessEnv):string | undefined {
  const value = process.env[key];
  return value;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<makeTransactionOutputData | errorOutput>
) {
  try {
    // parse request
    const { total, customerAccount, txRef } = req.body as makeTransactionInputData;
    const merchantAccount = extractAddr("MERCHANT_WALLET_ADDR");
    const amount = parseTotal(total);

    if(amount.toNumber() === 0) {
      res.status(400).json({error: "can't checkout with total of 0"});
      return
    }
    if (!txRef) {
      res.status(400).json({error: "transaction ref not provided"});
      return
    }
    if(!customerAccount){
      res.status(400).json({error: "no customer account provided"})
      return
    }
    if(!merchantAccount){
      res.status(400).json({error: "no merchant account provided"})
      return
    }

    const customerAddr = new PublicKey(customerAccount);
    const merchantAddr = new PublicKey(merchantAccount);

    // establish connection to Devnet
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network)
    const connection = new Connection(endpoint)
    const { blockhash } = await connection.getLatestBlockhash("confirmed");

    // create a Transaction
    const newTx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: customerAddr
    })

    // create Transaction instruction
    const transferIx = SystemProgram.transfer({
      fromPubkey: customerAddr,
      lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
      toPubkey: merchantAddr
    })

    // add instruction to Transaction and serialize it
    transferIx.keys.push({
      pubkey: new PublicKey(txRef),
      isSigner: false,
      isWritable: false
    })

    newTx.add(transferIx)

    const serializedTx = newTx.serialize({
      requireAllSignatures: false
    })

    const base64SerializedTx = serializedTx.toString('base64')

    // insert customerAddr, amount, shopId into DB ...

    // return the transaction
    res.status(200).json({
      transaction: base64SerializedTx,
      message: "Thank you for your purchase!"
    })
  } 
  catch(err) {
    res.status(500).json({
      error: "error creating new tx"
    })

  }
}