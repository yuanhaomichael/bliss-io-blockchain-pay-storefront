import { PropsWithChildren } from "react";
import Footer from "../Footer/Footer";
import styles from "./index.module.css";
import Head from "next/head";
import { useCart } from "../../lib/contexts/CartProvider";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export default function Layout({ children }: PropsWithChildren<{}>) {
  const { amount } = useCart();
  return (
    <div className={styles.container}>
      <Head>
        <title>Blockshop</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Link href="/">
        <h1 className={styles.title}>Blockshop</h1>
      </Link>

      <div className={styles.description}>
        <p className={styles.rowElement}>
          We accept Sol, USDC, Thank You Points, and NFT coupons
        </p>
        <p className={styles.rowElement}>Cart Total: {amount} USD</p>
        <div className={styles.button}>
          <WalletMultiButton />
        </div>
      </div>

      <main>{children}</main>
      <Footer />
    </div>
  );
}
