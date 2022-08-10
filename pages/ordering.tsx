import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Keypair, Transaction } from "@solana/web3.js";
import { useCart } from "../lib/contexts/CartProvider";
import { useEffect, useRef , useMemo, useState } from "react";
import { makeTransactionInputData, makeTransactionOutputData } from "./api/makeTransaction";
import { findReference, FindReferenceError } from "@solana/pay";
import { useRouter, Router } from "next/router";

function Ordering() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter()
  const { query } = router
  let payMethod = ''
  if (query.pay === "usd"){
    payMethod = 'usdc'
  }
  else if (query.pay === "sol"){
    payMethod = 'sol'
  }


  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [message, setMessage] = useState<string | null>(null);  

  const { amount } = useCart(); 
  console.log("amount", amount)

  const reference = useMemo(() => Keypair.generate().publicKey, []);
  console.log("ref", reference)

  async function getTransaction() {
    if (!publicKey) {
      return;
    }

    const body: makeTransactionInputData = {
      customerAccount: publicKey.toString(),
      total: amount,
      txRef: reference.toString()
    }

    const response = await fetch(`/api/makeTransaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    })

    const json = await response.json() as makeTransactionOutputData

    if (response.status !== 200) {
      console.error(json);
      return;
    }

    // Deserialize the transaction from the response
    const transaction = Transaction.from(Buffer.from(json.transaction, 'base64'));
    setTransaction(transaction);
    setMessage(json.message);
    console.log(transaction);
  }

  useEffect(() => {
    getTransaction()
  }, [publicKey])

  // send the tx
  async function trySendTx() {
    if(!transaction) {
      console.error("tx not valid")
      return
    }
    try {
      await sendTransaction(transaction, connection)
    } catch(e) {
      console.error(e)
    }
  }

  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) {
      trySendTx()
    } else {
      didMount.current = true;
    }
  }, [transaction]);

  // check every 0.5s if the transaction is completed
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const tx = await findReference(connection, reference)
        Router.push('/confirmed')
      }
      catch (e) {
        if (e instanceof FindReferenceError) {
          // console.error("no tx find matching reference")
          return
        }
        console.error("unknown error when confirming that you paid")
      }
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div>
      {message ?
      <p>{message} Please approve the transaction using your wallet</p> :
      <p>Creating transaction...</p>
    }
    </div>
  );
}

export default Ordering;