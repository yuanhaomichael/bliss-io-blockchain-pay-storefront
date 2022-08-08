import { useWallet } from "@solana/wallet-adapter-react";
import Products from "../components/Products/Products";

function Home() {
  const { publicKey } = useWallet();
  return (
    <div>
      <Products submitTarget="/checkout" enabled={publicKey !== null} />
    </div>
  );
}
export default Home;
