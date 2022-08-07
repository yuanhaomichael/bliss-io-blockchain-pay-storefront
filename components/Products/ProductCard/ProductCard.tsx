import styles from "./index.module.css";
import Image from "next/image";
import React from "react";
import { useState } from "react";
import { CartContext } from "../../../lib/hooks/CartProvider";

interface Props {
  name: string;
  price: number;
  description: string;
  image: string;
}

function ProductCard({ name, price, description, image }: Props) {
  const [quantity, setQuantity] = useState(1);
  return (
    <CartContext.Consumer>
      {({ amount, setAmount }) => (
        <div className={styles.container}>
          <h3>{name}</h3>
          <Image layout="fixed" width={200} height={200} src={image} />
          <p>${price}</p>
          <p>{description}</p>

          <form>
            <label>Quantity</label>
            <input
              className={styles.input}
              type="number"
              value={quantity}
              onChange={(e: React.FormEvent<HTMLInputElement>) => {
                const newValue = parseInt(e.currentTarget.value);
                if (newValue < 1) {
                  setQuantity(1)
                }
                else {setQuantity(newValue)}
            }}
            />
            <button
              className={styles.button}
              type="submit"
            >
              Add to Cart
            </button>
          </form>
        </div>
      )}
    </CartContext.Consumer>
  );
}

export default ProductCard;
