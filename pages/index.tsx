import Head from "next/head";
import Image from "next/image";
import Layout from "../components/Layout/Layout";
import { useWallet } from "@solana/wallet-adapter-react";
import SiteHeading from "../components/SiteHeading/SiteHeading";
import Products from "../components/Products/Products";

function Home() {
  const { publicKey } = useWallet();
  return (
    <div>
      <Products submitTarget='/checkout' enabled={publicKey !== null} />
    </div>
  );
}
export default Home;
