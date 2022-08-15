import { useEffect } from "react";
import Products from "../components/Products/Products";
import { useCart } from "../lib/contexts/CartProvider";

function Home() {
  const { setAmount } = useCart();
  useEffect(() => {
    setAmount(0);
  }, []);
  return (
    <div>
      <Products submitTarget="/checkout" />
    </div>
  );
}
export default Home;
