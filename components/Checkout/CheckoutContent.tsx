import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import styles from "./index.module.css";

interface props {
  submitTarget: string;
  usd: number;
  sol: number;
  canOrder: boolean;
  order: ParsedUrlQuery;
}
function CheckoutContent({ submitTarget, usd, sol, canOrder, order }: props) {
  const router = useRouter();
  const { publicKey } = useWallet();

  return (
    <div className={styles.container}>
      <form>
        <label className={styles.input}>Email</label>
        <input type="email" placeholder="joe@gmail.com"></input>
        <label className={styles.input}>Street</label>
        <input type="text" placeholder="23 santa ana st"></input>
        <label className={styles.input}>Apt Number</label>
        <input type="text" placeholder="apt. 303"></input>
        <label className={styles.input}>City</label>
        <input type="text" placeholder="Palo Alto"></input>
        <label className={styles.input}>State Abbr.</label>
        <input type="text" placeholder="CA"></input>
        <label className={styles.input}>Zipcode</label>
        <input type="number" placeholder="94083"></input>
        {!publicKey && (
          <p style={{ color: "red" }}>
            Connect your wallet first before placing an order or use mobile
            wallet
          </p>
        )}
        <br />
        <button
          className={styles.button}
          onClick={(e) => {
            e.preventDefault();
            if (publicKey) {
              router.push({
                pathname: submitTarget,
                query: { pay: "sol", method: "browser", ...order },
              });
            }
          }}
        >
          Place Order in Sol: {canOrder ? sol : "(loading...)"}
        </button>
        <button
          className={styles.button}
          onClick={(e) => {
            e.preventDefault();
            if (publicKey) {
              router.push({
                pathname: submitTarget,
                query: { pay: "usd", method: "browser", ...order },
              });
            }
          }}
        >
          Place Order in USDC: {canOrder ? usd : "(loading...)"}
        </button>

        <button
          className={styles.button}
          onClick={(e) => {
            e.preventDefault();

            router.push({
              pathname: submitTarget,
              query: { pay: "sol", method: "mobile", ...order },
            });
          }}
        >
          Place Order with Mobile in Sol: {canOrder ? sol : "(loading...)"}
        </button>
        <button
          className={styles.button}
          onClick={(e) => {
            e.preventDefault();

            router.push({
              pathname: submitTarget,
              query: { pay: "usd", method: "mobile", ...order },
            });
          }}
        >
          Place Order with Mobile in USDC: {canOrder ? usd : "(loading...)"}
        </button>
      </form>
    </div>
  );
}

export default CheckoutContent;
