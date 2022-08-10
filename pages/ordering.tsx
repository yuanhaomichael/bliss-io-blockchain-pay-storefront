import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Keypair, Transaction } from "@solana/web3.js";
import { useCart } from "../lib/contexts/CartProvider";
import { useEffect, useRef , useMemo, useState } from "react";
import { makeTransactionInputData, makeTransactionOutputData } from "./api/makeTransaction";
import { findReference, FindReferenceError } from "@solana/pay";
import { useRouter } from "next/router";
import { getSymbolUsdValue } from "../lib/getSymbolUsdValue";

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
  const [amountSol, setAmountSol] = useState(0);
  const { amount } = useCart(); 
  console.log("amount", amount)

  const reference = useMemo(() => Keypair.generate().publicKey, []);
  console.log("ref", reference)


  async function getTransaction(amount: number, amountSol: number) {
    if (!publicKey) {
      return;
    }

    const body: makeTransactionInputData = {
      customerAccount: publicKey.toString(),
      total: payMethod === "sol" ? amountSol : amount,
      txRef: reference.toString(),
      currency: payMethod
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

  // createTx call, depending on when sol amount is avail
  const didMount0 = useRef(false);
  useEffect(() => {
    const getSolToUsd = async () => {
      const solToUsd = await getSymbolUsdValue('sol')
      const tmp = amount / solToUsd
      setAmountSol(Math.round(tmp * 1000) / 1000)
    }
    getSolToUsd()
    if (didMount0.current) {
      console.log("before getting tx:", amount, amountSol)
      getTransaction(amount, amountSol)
    } else {
      didMount0.current = true
    }
    
  }, [amountSol])

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

  // trySendTx call, depending on whether tx is avail
  const didMount1 = useRef(false);
  useEffect(() => {
    if (didMount1.current) {
      trySendTx()
    } else {
      didMount1.current = true;
    }
  }, [transaction]);

  // check every 0.5s if the transaction is completed
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const tx = await findReference(connection, reference)
        router.push('/confirmed')
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