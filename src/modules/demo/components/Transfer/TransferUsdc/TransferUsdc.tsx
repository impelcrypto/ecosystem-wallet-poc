"use client";

import { useThirdwebContext } from "@/modules/thirdweb/context/useThirdwebContext";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { sepolia } from "thirdweb/chains";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { erc20Abi, parseUnits } from "viem";
import styles from "../Transfer.module.css";

const usdcContractAddress = {
  sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
};

export function TransferUsdc(): JSX.Element {
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;
  const [isPending, setIsPending] = useState(false);

  const {
    state: { client, publicClient, walletClient },
  } = useThirdwebContext();

  const { data: bal } = useWalletBalance({
    client,
    address: walletAddress,
    chain: sepolia,
    tokenAddress: usdcContractAddress.sepolia,
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

  async function sendUsdcToken() {
    if (!walletClient || !publicClient || !activeAccount) return;

    try {
      setIsPending(true);
      const decimals = await publicClient.readContract({
        address: usdcContractAddress.sepolia,
        abi: erc20Abi,
        functionName: "decimals",
        args: [],
      });
      const arg = {
        account: activeAccount?.address,
        address: usdcContractAddress.sepolia,
        abi: erc20Abi,
        functionName: "transfer",
        args: [toAddress, parseUnits(String(amount), decimals)],
      } as const;
      const { request } = await publicClient.simulateContract({
        ...arg,
      });
      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: hash,
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
    toast.promise(sendUsdcToken(), {
      loading: "Loading...",
      success: "Transaction Completed",
      error: "Transaction Failed",
    });
  }

  return (
    <div className={styles.boxToken}>
      <div>
        <span>Token: USDC</span>
      </div>
      <div>
        <span>Balance: {Number(bal?.displayValue).toFixed(3)} USDC</span>
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
        <a href="https://faucet.circle.com/" target="_blank" rel="noreferrer">
          USDC Faucet
        </a>
      </div>
    </div>
  );
}
