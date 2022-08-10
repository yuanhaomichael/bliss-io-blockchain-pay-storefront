import { useContext, createContext } from "react";

export type CartContextType = {
  amount: number;
  setAmount: (amount: number) => void;
};

export const CartContext = createContext<CartContextType>({
  amount: 0,
  setAmount: (amount) => amount,
});

export const useCart = () => useContext(CartContext);
