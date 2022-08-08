import styles from "./index.module.css";
import Image from "next/image";
import React, { useEffect } from "react";
import { useState } from "react";
import { useCart } from "../../../lib/hooks/CartProvider";

interface Props {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  index: number;
  lineItems: {};
  setLineItems: ({}) => void;
}

function ProductCard({
  id,
  name,
  price,
  description,
  image,
  index,
  lineItems,
  setLineItems,
}: Props) {
  const { amount, setAmount } = useCart();
  const [quantity, setQuantity] = useState(0);
  const [quantityChange, setQuantityChange] = useState(0);

  useEffect(() => {
    setAmount(amount + quantityChange * price);
    setLineItems({ ...lineItems, [id]: quantity });
  }, [quantity]);

  return (
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
            setQuantityChange(newValue - quantity);
            if (newValue < 0) {
              setQuantity(0);
            } else {
              setQuantity(newValue);
            }
          }}
        />
      </form>
    </div>
  );
}

export default ProductCard;
