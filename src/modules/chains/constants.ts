import { type Chain, sepolia } from "viem/chains";

export const RPC_URL = {
  sepolia: {
    default: {
      http: [
        "https://ethereum-sepolia-rpc.publicnode.com",
        "https://rpc.ankr.com/eth_sepolia",
        "https://sepolia.infura.io/v3/7d846183d6da49838adc9f445ba7a61f",
      ],
    },
  },
  minato: {
    default: { http: ["https://rpc.minato.soneium.org"] },
  },
};

const L2_BLOCK_EXPLORER = {
  testnet: {
    default: {
      name: "Blockscout",
      url: "https://explorer-testnet.soneium.org",
    },
  },
};

export const SEPOLIA_TESTNET = {
  ...sepolia,
  rpcUrls: RPC_URL.sepolia,
} as const;

export const MINATO = {
  id: 1946,
  name: "Minato",
  iconUrl: "/icon-soneium.svg",
  iconBackground: "#fff",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: RPC_URL.minato,
  blockExplorers: L2_BLOCK_EXPLORER.testnet,
} as const;

export enum ChainId {
  Sepolia = 11155111,
  Minato = 1946,
}
