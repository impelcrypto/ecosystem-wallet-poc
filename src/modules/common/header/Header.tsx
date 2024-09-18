"use client";

import { MINATO_TW } from "@/modules/chains/constants";
import { useThirdwebContext } from "@/modules/thirdweb/context/useThirdwebContext";
import { useEffect } from "react";
import { viemAdapter } from "thirdweb/adapters/viem";
import { sepolia } from "thirdweb/chains";
import { ConnectButton, useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { createWallet, ecosystemWallet } from "thirdweb/wallets";
import type { PublicClient, WalletClient } from "viem";
import styles from "./Header.module.css";

const ecosystemId = String(process.env.NEXT_PUBLIC_ECOSYSTEM_ID) as `ecosystem.${string}`;
const partnerId = String(process.env.NEXT_PUBLIC_PARTNER_ID);

export function Header(): JSX.Element {
  const {
    state: { client },
    setWalletClient,
    setPublicClient,
  } = useThirdwebContext();
  const activeAccount = useActiveAccount();
  const activeChain = useActiveWalletChain();

  const wallet = ecosystemWallet(ecosystemId, {
    partnerId,
  });

  const walletClient =
    activeAccount && activeChain
      ? viemAdapter.walletClient.toViem({
          account: activeAccount,
          client,
          chain: activeChain,
        })
      : undefined;

  useEffect(() => {
    console.log("env", process.env.NEXT_PUBLIC_PARTNER_ID);
    if (!walletClient) return;
    setWalletClient(walletClient as WalletClient);
  }, [walletClient, setWalletClient]);

  useEffect(() => {
    const publicClient = viemAdapter.publicClient.toViem({
      chain: activeChain === undefined ? sepolia : activeChain,
      client: client,
    }) as PublicClient;
    setPublicClient(publicClient);
  }, [client, setPublicClient, activeChain]);

  return (
    <header className={styles.container}>
      <div>
        <span>Thirdweb Ecosystem Wallet Demo</span>
      </div>
      <div>
        <ConnectButton
          client={client}
          wallets={[wallet, createWallet("io.metamask")]}
          chains={[sepolia, MINATO_TW]}
          theme="dark"
        />
      </div>
    </header>
  );
}
