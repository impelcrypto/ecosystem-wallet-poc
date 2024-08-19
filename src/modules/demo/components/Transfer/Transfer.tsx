"use client";

import { Button, Input } from "antd";
import { useEffect, useState } from "react";
import { createThirdwebClient, defineChain } from "thirdweb";
import { viemAdapter } from "thirdweb/adapters/viem";
import { sepolia } from "thirdweb/chains";
import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
  useSetActiveWallet,
} from "thirdweb/react";
import { createWallet, createWalletAdapter, ecosystemWallet } from "thirdweb/wallets";
import { isAddress, parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { type BaseError, useClient, useWaitForTransactionReceipt } from "wagmi";
import styles from "./Transfer.module.css";

export function Transfer(): JSX.Element {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const ecosystemId = String(process.env.NEXT_PUBLIC_ECOSYSTEM_ID) as any;
  const partnerId = String(process.env.NEXT_PUBLIC_PARTNER_ID);
  const clientId = String(process.env.NEXT_PUBLIC_CLIENT_ID);

  const wallet = ecosystemWallet(ecosystemId, {
    partnerId,
  });
  const client = createThirdwebClient({
    clientId,
  });

  const { address } = useAccount();
  const wagmiAccount = useAccount();
  const { data: balance } = useBalance({
    address,
  });
  const activeAccount = useActiveAccount();
  // console.log("activeAccount", activeAccount);

  const [toAddress, setToAddress] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const { data: hash, sendTransaction, isPending, error } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const c = useClient();
  const nativeToken = c?.chain.nativeCurrency.symbol;

  const sendNativeToken = async (): Promise<void> => {
    try {
      if (!isAddress(toAddress)) {
        throw Error("Invalid address");
      }
      sendTransaction({ to: toAddress, value: parseEther(String(amount)) });
    } catch (error) {
      console.error(error);
      // openNotification("topRight", "Error", error.message);
    }
  };

  const { data: walletClient } = useWalletClient();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const setActiveWallet = useSetActiveWallet();

  useEffect(() => {
    const setActive = async () => {
      if (walletClient) {
        const adaptedAccount = viemAdapter.walletClient.fromViem({
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          walletClient: walletClient as any, // accounts for wagmi/viem version mismatches
        });
        const w = createWalletAdapter({
          adaptedAccount,
          chain: defineChain(await walletClient.getChainId()),
          client,
          onDisconnect: async () => {
            await disconnectAsync();
          },
          switchChain: async (chain) => {
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            await switchChainAsync({ chainId: chain.id as any });
          },
        });
        setActiveWallet(w);
      }
    };
    setActive();
  }, [walletClient, disconnectAsync, switchChainAsync, setActiveWallet, client]);

  // handle disconnecting from wagmi
  const thirdwebWallet = useActiveWallet();
  useEffect(() => {
    const disconnectIfNeeded = async () => {
      if (thirdwebWallet && wagmiAccount.status === "disconnected") {
        console.log("disconnect?");
        await thirdwebWallet.disconnect();
      }
    };
    disconnectIfNeeded();
  }, [wagmiAccount, thirdwebWallet]);

  return (
    <div className={styles.container}>
      <div className={styles.connectButton}>
        <ConnectButton
          client={client}
          // wallets={[wallet]}
          wallets={[wallet, createWallet("io.metamask")]}
          chain={sepolia}
        />
      </div>
      {activeAccount && (
        <div>
          <div>
            <span>Address: {address}</span>
          </div>
          <div>
            <span>Balance: {Number(balance?.formatted).toFixed(3)} ETH</span>
          </div>
          <div>
            <Input
              name="address"
              placeholder="0xA0Cf…251e"
              required
              onChange={(e) => setToAddress(e.target.value)}
            />
            <br />
            <br />
            <Input
              name="value"
              placeholder="0.05"
              required
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <br />
            <br />
            <Button disabled={isPending} type="primary" onClick={sendNativeToken}>
              {isPending ? "Confirming..." : `Send ${nativeToken}`}
            </Button>
            {hash && <div>Transaction Hash: {hash}</div>}
            {isConfirming && <div>Waiting for confirmation...</div>}
            {isConfirmed && <div>Transaction confirmed.</div>}
            {error && <div>Error: {(error as BaseError).shortMessage || error.message}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
