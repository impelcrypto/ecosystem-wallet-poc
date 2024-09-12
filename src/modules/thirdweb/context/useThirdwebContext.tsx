"use client";

import {
  type Dispatch,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { type ThirdwebClient, createThirdwebClient } from "thirdweb";
import { viemAdapter } from "thirdweb/adapters/viem";
import { sepolia } from "thirdweb/chains";
import { ThirdwebProvider } from "thirdweb/react";
import type { PublicClient, WalletClient } from "viem";

export enum ThirdwebContext {
  SetPublicClient = "SET_PUBLIC_CLIENT",
  SetWalletClient = "SET_WALLET_CLIENT",
}

type SetPublicClient = {
  type: ThirdwebContext.SetPublicClient;
  payload: PublicClient;
};

type SetWalletClient = {
  type: ThirdwebContext.SetWalletClient;
  payload: WalletClient;
};

type ThirdwebActions = SetPublicClient | SetWalletClient;

interface NetworkState {
  client: ThirdwebClient;
  publicClient: PublicClient | undefined;
  walletClient: WalletClient | undefined;
}

const initialState: NetworkState = {
  publicClient: undefined,
  walletClient: undefined,
  client: createThirdwebClient({
    clientId: String(process.env.NEXT_PUBLIC_CLIENT_ID),
  }),
};

const reducer = (state: NetworkState, action: ThirdwebActions): NetworkState => {
  switch (action.type) {
    case ThirdwebContext.SetPublicClient:
      return { ...state, publicClient: action.payload };
    case ThirdwebContext.SetWalletClient:
      return { ...state, walletClient: action.payload };
    default:
      return state;
  }
};

interface ContextType {
  state: NetworkState;
  dispatch: Dispatch<ThirdwebActions>;
  setPublicClient: (publicClient: PublicClient) => void;
  setWalletClient: (walletClient: WalletClient) => void;
}

const ThirdwebSdkProvider = createContext<ContextType | undefined>(undefined);

const ThirdwebContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setPublicClient = useCallback((publicClient: PublicClient) => {
    dispatch({ type: ThirdwebContext.SetPublicClient, payload: publicClient });
  }, []);

  const setWalletClient = useCallback(
    (walletClient: WalletClient) => {
      if (state.walletClient?.account?.address === walletClient.account?.address) return;
      dispatch({ type: ThirdwebContext.SetWalletClient, payload: walletClient });
    },
    [state.walletClient?.account?.address],
  );

  const contextValue: ContextType = useMemo(
    () => ({
      state,
      dispatch,
      setPublicClient,
      setWalletClient,
    }),
    [state, setPublicClient, setWalletClient],
  );

  useEffect(() => {
    const publicClient = viemAdapter.publicClient.toViem({
      chain: sepolia,
      client: state.client,
    }) as PublicClient;
    setPublicClient(publicClient);
  }, [state.client, setPublicClient]);

  return (
    <ThirdwebSdkProvider.Provider value={contextValue}>
      {/* Memo: Adding ThirdwebProvider makes the app slow in reflecting the changes */}
      <ThirdwebProvider>{children}</ThirdwebProvider>
    </ThirdwebSdkProvider.Provider>
  );
};

const useThirdwebContext = () => {
  const context = useContext(ThirdwebSdkProvider);
  if (context === undefined) {
    throw new Error("Something went wrong with ThirdwebContextProvider");
  }
  return context;
};

export { ThirdwebContextProvider, useThirdwebContext };
