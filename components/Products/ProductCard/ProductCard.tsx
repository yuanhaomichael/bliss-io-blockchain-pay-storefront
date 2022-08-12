import styles from "./index.module.css";
import Image from "next/image";
import React, { useEffect } from "react";
import { useState } from "react";
import { useCart } from "../../../lib/contexts/CartProvider";
import { QuantityPicker } from "react-qty-picker";

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
      <Image
        layout="fixed"
        alt="product photos"
        width={200}
        height={200}
        src={image}
      />
      <p>${price}</p>
      <p>{description}</p>

      <div className={styles.picker}>
        <QuantityPicker
          min={0}
          smooth
          onChange={(value: number) => {
            const newValue = value;
            setQuantityChange(newValue - quantity);
            if (newValue < 0) {
              setQuantity(0);
            } else {
              setQuantity(newValue);
            }
          }}
        />
      </div>
    </div>
  );
}

export default ProductCard;
