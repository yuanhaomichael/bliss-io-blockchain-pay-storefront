import { useRouter } from "next/router";
import styles from "./index.module.css";

interface props {
  submitTarget: string; 
  enabled: boolean; 
  usd: number;
  sol: number;
}
function CheckoutContent({ submitTarget, enabled, usd, sol }: props) {
  const router = useRouter()
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
        {!enabled && <p>Connect your wallet first before placing an order</p>}
        <br/>
        <button className={styles.button} onClick={(e) => {
      e.preventDefault()
      if(enabled) {
        router.push({ pathname: submitTarget, query: { pay: "sol" }})
      }
    }}>Place Order in Sol: {sol}</button>
        <button className={styles.button} onClick={(e) => {
      e.preventDefault()
      if(enabled) {
        router.push({ pathname: submitTarget, query: { pay: "usdc" }})
      }
    }}>Place Order in USDC: {usd}</button>

      </form>
    </div>
  );
}

export default CheckoutContent;
