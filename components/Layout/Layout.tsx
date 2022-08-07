import { PropsWithChildren } from "react";
import Footer from "../Footer/Footer";
import styles from "./index.module.css";
import Head from "next/head";
import { useCart } from "../../lib/hooks/CartProvider";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Layout({ children }: PropsWithChildren<{}>) {
  const { amount } = useCart();
  return (
    <div>
      <Head>
        <title>Blockshop</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className={styles.title}>Blockshop</h1>
      <div className={styles.description}>
        <p className={styles.rowElement}>
          We accept Sol, USDC, Thank You Points, and NFT coupons
        </p>
        <p className={styles.rowElement}>Cart Total: {amount}</p>
        <WalletMultiButton />
      </div>

      <main>{children}</main>
      <Footer />
    </div>
  );
}
