"use client";

import { useThirdwebContext } from "@/modules/thirdweb/context/useThirdwebContext";
import { useActiveAccount } from "thirdweb/react";
import type { Address, PublicClient, WalletClient } from "viem";
import styles from "./Transfer.module.css";
import { TransferEth } from "./TransferEth/TransferEth";
import { TransferUsdc } from "./TransferUsdc/TransferUsdc";

export function Transfer(): JSX.Element {
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;

  const {
    state: { client, publicClient, walletClient },
  } = useThirdwebContext();

  return (
    <div className={styles.container}>
      {activeAccount && (
        <div>
          <div>
            <span>Wallet Address: {activeAccount?.address}</span>{" "}
          </div>
          <div className={styles.boxTokens}>
            <TransferEth />
            <TransferUsdc />
          </div>
        </div>
      )}
    </div>
  );
}
