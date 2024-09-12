"use client";

import { useThirdwebContext } from "@/modules/thirdweb/context/useThirdwebContext";
import { useEffect } from "react";
import { viemAdapter } from "thirdweb/adapters/viem";
import { sepolia } from "thirdweb/chains";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { ecosystemWallet } from "thirdweb/wallets";
import type { WalletClient } from "viem";
import styles from "./Header.module.css";

const ecosystemId = String(process.env.NEXT_PUBLIC_ECOSYSTEM_ID) as `ecosystem.${string}`;
const partnerId = String(process.env.NEXT_PUBLIC_PARTNER_ID);

export function Header(): JSX.Element {
  const {
    state: { client },
    setWalletClient,
  } = useThirdwebContext();
  const activeAccount = useActiveAccount();

  const wallet = ecosystemWallet(ecosystemId, {
    partnerId,
  });

  const walletClient = activeAccount
    ? viemAdapter.walletClient.toViem({
        account: activeAccount,
        client,
        chain: sepolia,
      })
    : undefined;

  useEffect(() => {
    if (!walletClient) return;
    setWalletClient(walletClient as WalletClient);
  }, [setWalletClient, walletClient]);

  return (
    <header className={styles.container}>
      <div>
        <span>Thirdweb Ecosystem Wallet Demo</span>
      </div>
      <div>
        <ConnectButton client={client} wallets={[wallet]} chain={sepolia} />
      </div>
    </header>
  );
}
