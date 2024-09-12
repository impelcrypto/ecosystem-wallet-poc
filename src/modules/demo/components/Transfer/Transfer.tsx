"use client";

import { useActiveAccount } from "thirdweb/react";
import styles from "./Transfer.module.css";
import { TransferEth } from "./TransferEth/TransferEth";
import { TransferUsdc } from "./TransferUsdc/TransferUsdc";

export function Transfer(): JSX.Element {
  const activeAccount = useActiveAccount();

  return (
    <div className={styles.container}>
      {activeAccount && (
        <div>
          <div>
            <span>Wallet Address: {activeAccount?.address}</span>
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
