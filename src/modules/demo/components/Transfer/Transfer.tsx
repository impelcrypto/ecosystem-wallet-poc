"use client";

import { createThirdwebClient } from "thirdweb";
import { viemAdapter } from "thirdweb/adapters/viem";
import { sepolia } from "thirdweb/chains";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createWallet, ecosystemWallet } from "thirdweb/wallets";
import type { Address, PublicClient, WalletClient } from "viem";
import styles from "./Transfer.module.css";
import { TransferEth } from "./TransferEth/TransferEth";
import { TransferUsdc } from "./TransferUsdc/TransferUsdc";

export function Transfer(): JSX.Element {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const ecosystemId = String(process.env.NEXT_PUBLIC_ECOSYSTEM_ID) as any;
  const partnerId = String(process.env.NEXT_PUBLIC_PARTNER_ID);
  const clientId = String(process.env.NEXT_PUBLIC_CLIENT_ID);

  const activeAccount = useActiveAccount();

  const wallet = ecosystemWallet(ecosystemId, {
    partnerId,
  });

  const client = createThirdwebClient({
    clientId,
  });

  // const chain = useChain();
  // console.log("chain", chain);

  const walletAddress = activeAccount?.address;

  const publicClient = viemAdapter.publicClient.toViem({
    chain: sepolia,
    client,
  });

  const walletClient = activeAccount
    ? viemAdapter.walletClient.toViem({
        account: activeAccount,
        client,
        chain: sepolia,
      })
    : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.connectButton}>
        <ConnectButton
          client={client}
          wallets={[wallet, createWallet("io.metamask")]}
          chain={sepolia}
        />
      </div>

      {activeAccount && (
        <div>
          <br />
          <div>{/* <span>Wallet Address: {activeAccount?.address}</span> */}</div>
          <div className={styles.boxTokens}>
            <TransferEth
              client={client}
              walletClient={walletClient as WalletClient}
              publicClient={publicClient as PublicClient}
              walletAddress={walletAddress as Address}
            />
            <TransferUsdc
              client={client}
              walletClient={walletClient as WalletClient}
              publicClient={publicClient as PublicClient}
              walletAddress={walletAddress as Address}
            />
          </div>
        </div>
      )}
    </div>
  );
}
