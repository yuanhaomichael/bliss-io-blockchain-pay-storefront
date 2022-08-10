import CheckoutContent from "../components/Checkout/CheckoutContent";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCart } from "../lib/contexts/CartProvider";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

function Checkout() {
  const { publicKey } = useWallet();
  const [total, setTotal] = useState(0);
  const { amount, setAmount } = useCart();
  const [canOrder, setCanOrder] = useState(false);
  const router = useRouter();
  const { query } = router;

  const [totalSol, setTotalSol] = useState(0);

  async function calculateAmount() {
    if (!query) {
      console.error("query is empty");
      return;
    }
    const body = {
      params: query,
    };
    const response = await fetch(`/api/calculateAmount`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (response.status !== 200) {
      console.error("calculate amount failed", json);
      return;
    }
    setTotal(parseFloat(json.amount));
    setTotalSol(parseFloat(json.amountSol));
  }

  const didMount = useRef(false);
  useEffect(() => {
    calculateAmount();
    console.log(
      "checkout page amount",
      total,
      totalSol,
      "context amount",
      amount
    );
    if (didMount.current) {
      if (totalSol > 0 && total !== 0 && total === amount) {
        setCanOrder(true);
      }
      setAmount(total);
    } else {
      didMount.current = true;
    }
  }, [
    () => {
      return totalSol > 0 && total !== 0 && total === amount;
    },
  ]);

  return (
    <div>
      {canOrder ? (
        <CheckoutContent
          submitTarget="/ordering"
          enabled={publicKey !== null}
          usd={total}
          sol={totalSol}
          canOrder={canOrder}
        />
      ) : (
        <CheckoutContent
          submitTarget="/"
          enabled={publicKey !== null}
          usd={total}
          sol={totalSol}
          canOrder={canOrder}
        />
      )}
    </div>
  );
}

export default Checkout;
