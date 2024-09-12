"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { viemAdapter } from "thirdweb/adapters/viem";
import { sepolia } from "thirdweb/chains";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { type Address, type PublicClient, type WalletClient, erc20Abi, parseUnits } from "viem";
import styles from "../Transfer.module.css";

interface Props {
  client: any;
  walletAddress: Address;
  publicClient: any;
  walletClient: WalletClient;
}

const usdcContractAddress = {
  sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
};

export function TransferUsdc({ client, walletAddress, publicClient }: Props): JSX.Element {
  const activeAccount = useActiveAccount();
  const [isPending, setIsPending] = useState(false);
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
