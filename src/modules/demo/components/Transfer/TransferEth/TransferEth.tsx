"use client";

import { useThirdwebContext } from "@/modules/thirdweb/context/useThirdwebContext";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useActiveAccount, useActiveWalletChain, useWalletBalance } from "thirdweb/react";
import { parseEther } from "viem";
import styles from "../Transfer.module.css";

export function TransferEth(): JSX.Element {
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;
  const activeChain = useActiveWalletChain();

  const {
    state: { client, publicClient, walletClient },
  } = useThirdwebContext();

  const [isPending, setIsPending] = useState(false);
  const { data: bal } = useWalletBalance({
    client,
    address: walletAddress,
    chain: activeChain,
  });

  const [toAddress, setToAddress] = useState<string>("");
  const inputAddressRef = useRef<HTMLInputElement>(null);
  const inputAmountRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState<number>(0);

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
    if (!walletClient || !publicClient || !activeAccount || activeChain === undefined) return;

    try {
      setIsPending(true);
      const tx = {
        account: activeAccount?.address,
        to: toAddress,
        value: parseEther(String(amount)),
        chain: activeChain,
      };
      // @ts-ignore
      const hash = await walletClient.sendTransaction(tx);
      await publicClient.waitForTransactionReceipt({
        hash,
      });
      resetStates();
      return "";
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
        <span>Balance: {Number(Number(bal?.displayValue).toFixed(3))} ETH</span>
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
      <div className={styles.linkUsdcFaucet}>
        <a
          href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
          target="_blank"
          rel="noreferrer"
        >
          sETH Faucet
        </a>
      </div>
    </div>
  );
}
