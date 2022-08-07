import styles from "./index.module.css";
import productList from "../../lib/productList";
import ProductCard from "./ProductCard/ProductCard";

interface Props {
  submitTarget: string;
  enabled: boolean;
}

function Products({ submitTarget: string, enabled }: Props) {
  return (
    <div className={styles.container}>
      {productList.map((p, index) => (
        <div key={index}>
          <ProductCard
            name={p.name}
            price={p.priceUsd}
            description={p.description}
            image={p.photo}
          />
        </div>
      ))}
      <form action="/checkout">
        <button className={styles.button}>Checkout</button>
      </form>
    </div>
  );
}

export default Products;
