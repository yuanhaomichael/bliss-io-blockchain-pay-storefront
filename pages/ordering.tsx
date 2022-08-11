import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Keypair, Transaction, PublicKey} from "@solana/web3.js";
import { useCart } from "../lib/contexts/CartProvider";
import { useEffect, useRef, useMemo, useState } from "react";
import generateSolPayUrl from "../lib/generateSolPayUrl";
import {
  makeTransactionInputData,
  makeTransactionOutputData,
} from "./api/makeTransaction";
import { findReference, FindReferenceError, createQR, validateTransfer } from "@solana/pay";
import { useRouter } from "next/router";
import { getSymbolUsdValue } from "../lib/getSymbolUsdValue";
import BigNumber from "bignumber.js";

function Ordering() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const { query } = router;
  let payMethod = ""
  let payCurrency = "";
  if (query.pay === "usd") {
    payCurrency = "usd";
  } else if (query.pay === "sol") {
    payCurrency = "sol";
  }
  if (query.method === "browser"){
    payMethod = "browser"
  } else if (query.method === "mobile"){
    payMethod = 'mobile'
  }

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [amountSol, setAmountSol] = useState(0);
  const { amount } = useCart();
  console.log("amount in ordering.tsx", amount);

  const reference = useMemo(() => Keypair.generate().publicKey, []);
  console.log("ref", reference);

  const qrRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const total = payCurrency === 'sol' ? amountSol : amount
    const url = generateSolPayUrl(total, payCurrency, reference)
    const qr = createQR(url, 256, 'transparent')
    if(qrRef.current && amount > 0 && amountSol>0){
      qrRef.current.innerHTML = ''
      qr.append(qrRef.current)
    }      
  })

  async function getTransaction(amount: number, amountSol: number) {
    if (!publicKey) {
      return;
    }

    const body: makeTransactionInputData = {
      customerAccount: publicKey.toString(),
      total: payCurrency === "sol" ? amountSol : amount,
      txRef: reference.toString(),
      currency: payCurrency,
    };
    console.log("body for create tx request", body)

    const response = await fetch(`/api/makeTransaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = (await response.json()) as makeTransactionOutputData;

    if (response.status !== 200) {
      console.error(json);
      return;
    }

    // Deserialize the transaction from the response
    const transaction = Transaction.from(
      Buffer.from(json.transaction, "base64")
    );
    setTransaction(transaction);
    setMessage(json.message);
    console.log(transaction);
  }

  // createTx call, depending on when sol amount is avail
  const didMount0 = useRef(false);
  useEffect(() => {
    const getSolToUsd = async () => {
      const solToUsd = await getSymbolUsdValue("sol");
      const tmp = amount / solToUsd;
      setAmountSol(Math.round(tmp * 1000) / 1000);
    };
    getSolToUsd();
    if (didMount0.current && payMethod==="browser") {
      console.log("before getting tx:", amount, amountSol);
      if(amount > 0 && amountSol>0){
      getTransaction(amount, amountSol);}
    } else if (!didMount0.current && payMethod==="browser"){
      didMount0.current = true;
    }
  }, [amountSol]);

  // send the tx
  async function trySendTx() {
    if (!transaction) {
      console.error("tx not valid");
      return;
    }
    try {
      await sendTransaction(transaction, connection);
    } catch (e) {
      console.error(e);
    }
  }

  // trySendTx call, depending on whether tx is avail
  const didMount1 = useRef(false);
  useEffect(() => {
    if (didMount1.current && payMethod==="browser") {
      trySendTx();
    } else if (!didMount1.current && payMethod==="browser") {
      didMount1.current = true;
    }
  }, [transaction]);

  // check every 0.3s if the transaction is completed
  useEffect(() => {
    const interval = setInterval(async () => {
      if (payMethod === "browser"){
        try {
        const tx = await findReference(connection, reference);
        router.push("/confirmed");
        } catch (e) {
          if (e instanceof FindReferenceError) {
            // console.error("no tx find matching reference")
            return;
          }
          console.error("unknown error when confirming that you paid");
        }
      }
      if (payMethod === "mobile") {
        try {
          const signatureInfo = await findReference(connection, reference, {finality: "confirmed"})
          const merchant = new PublicKey("DknJQ9k5dfA54QwLoiACyB1vPpCTHBXbecHajvyLacvw")
          const usdcAddr = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr")
          await validateTransfer(
            connection,
            signatureInfo.signature,
            {
              recipient: merchant,
              amount: payCurrency === "sol" ? new BigNumber(amountSol) : new BigNumber(amount),
              splToken: payCurrency === "sol" ? undefined : usdcAddr,
              reference
            },
            { commitment: 'confirmed'}
          )
          router.push('/confirmed')
        } catch (e){
          console.error(e)
        }
      }
      
    }, 300);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if(payMethod === 'browser'){
  return (
    <div>
      {message ? (
        <p>{message} Please approve the transaction using your wallet</p>
      ) : (
        <p>Creating transaction...</p>
      )}
    </div>
  ); }
  else if (payMethod === "mobile") {
    return (<div>
      <p>use your wallet to scan</p>
      <div ref={qrRef}></div>
    </div>)
  }
  else {
    return (<p>unknown error.</p>)
  }
}

export default Ordering;
