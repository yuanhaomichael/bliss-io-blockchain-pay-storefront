import {useContext, createContext} from 'react'


export type CartContextType = {
  amount: number;
  setAmount: (newAmount: number) => void;
}

export const CartContext = createContext<CartContextType>({ 
  amount: 0,
  setAmount: newAmount => newAmount
});
export const useCart = () => useContext(CartContext);