import styles from "./index.module.css";
import productList from "../../lib/productList";
import ProductCard from "./ProductCard/ProductCard";
import { useCart } from "../../lib/hooks/CartProvider";
import Link from "next/link";
import { useState } from "react";

interface Props {
  submitTarget: string;
  enabled: boolean;
}

function Products({ submitTarget: string, enabled }: Props) {
  const { amount } = useCart();
  const [lineItems, setLineItems] = useState({});

  return (
    <div className={styles.container}>
      {productList.map((p, index) => {
        return (
          <div key={index}>
            <ProductCard
              id={p.id}
              name={p.name}
              price={p.priceUsd}
              description={p.description}
              image={p.photo}
              index={index}
              lineItems={lineItems}
              setLineItems={setLineItems}
            />
          </div>
        );
      })}
      <Link
        href={{
          pathname: "/checkout",
          query: { amount: amount, ...lineItems },
        }}
      >
        <button className={styles.button}>Checkout</button>
      </Link>
    </div>
  );
}

export default Products;
