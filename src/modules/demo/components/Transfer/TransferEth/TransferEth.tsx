"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { viemAdapter } from "thirdweb/adapters/viem";
import { sepolia } from "thirdweb/chains";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { type Address, type PublicClient, type WalletClient, parseEther } from "viem";
import styles from "../Transfer.module.css";

interface Props {
  client: any;
  walletAddress: Address;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

export function TransferEth({ client, walletAddress, publicClient }: Props): JSX.Element {
  const activeAccount = useActiveAccount();
  const [isPending, setIsPending] = useState(false);
  const { data: bal, isLoading } = useWalletBalance({
    client,
    address: walletAddress,
    chain: sepolia,
  });

  const [toAddress, setToAddress] = useState<string>("");
  const inputAddressRef = useRef<HTMLInputElement>(null);
  const inputAmountRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState<number>(0);

  const walletClient = activeAccount
    ? viemAdapter.walletClient.toViem({
        account: activeAccount,
        client,
        chain: sepolia,
      })
    : undefined;

  function resetStates(): void {
    setAmount(0);
    setToAddress("");
    if (inputAddressRef.current instanceof HTMLInputElement) {
      inputAddressRef.current.value = "";
    }
    if (inputAmountRef.current instanceof HTMLInputElement) {
      inputAmountRef.current.value = "";
    }
  }

  async function sendNativeToken() {
    if (!walletClient || !publicClient || !activeAccount) return;

    try {
      setIsPending(true);
      const hash = await walletClient.sendTransaction({
        account: activeAccount?.address,
        to: toAddress,
        value: parseEther(String(amount)),
        chain: sepolia as any,
      });
      await publicClient.waitForTransactionReceipt({
        hash,
      });
      resetStates();
      return hash;
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  function sendTransaction() {
    toast.promise(sendNativeToken(), {
      loading: "Loading...",
      success: "Transaction Completed",
      error: "Transaction Failed",
    });
  }

  return (
    <div className={styles.boxToken}>
      <div>
        <span>Token: ETH</span>
      </div>
      <div>
        <span>Balance: {Number(bal?.displayValue).toFixed(3)} ETH</span>
      </div>
      <div>
        <div className={styles.inputRow}>
          <p className={styles.labelInput}>To Address</p>
          <input
            ref={inputAddressRef}
            name="address"
            placeholder="0xA0Cf…251e"
            required
            onChange={(e) => setToAddress(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.inputRow}>
          <p className={styles.labelInput}>Amount</p>
          <input
            ref={inputAmountRef}
            name="value"
            placeholder="0.05"
            required
            onChange={(e) => setAmount(Number(e.target.value))}
            className={styles.input}
          />
        </div>
        <br />
        <button
          disabled={isPending || !toAddress || !amount}
          className={styles.buttonAction}
          onClick={sendTransaction}
          type="button"
        >
          {isPending ? "Confirming..." : `Send ${bal?.symbol}`}
        </button>
      </div>
    </div>
  );
}
