import styles from "./index.module.css";
function Checkout() {
  return (
    <div className={styles.container}>
      <form>
        <label className={styles.input}>Street</label>
        <input type="text" placeholder="235 santa ana st"></input>
        <label className={styles.input}>Apt Number</label>
        <input type="text" placeholder="apt. 303"></input>
        <label className={styles.input}>City</label>
        <input type="text" placeholder="Palo Alto"></input>
        <label className={styles.input}>State Abbr.</label>
        <input type="text" placeholder="CA"></input>
        <label className={styles.input}>Zipcode</label>
        <input type="text" placeholder="94083"></input>

        <button className={styles.button} type="submit">
          Place Order
        </button>
      </form>
    </div>
  );
}

export default Checkout;
