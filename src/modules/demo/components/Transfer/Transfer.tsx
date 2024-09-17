"use client";

import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import styles from "./Transfer.module.css";
import { TransferEth } from "./TransferEth/TransferEth";
import { TransferUsdc } from "./TransferUsdc/TransferUsdc";

export function Transfer(): JSX.Element {
  const activeAccount = useActiveAccount();
  const activeChain = useActiveWalletChain();

  return (
    <div className={styles.container}>
      {activeAccount && (
        <div>
          <div>
            <span>Wallet Address: {activeAccount?.address}</span>
          </div>
          <div>
            <span>Connected Network: {activeChain?.name}</span>
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
