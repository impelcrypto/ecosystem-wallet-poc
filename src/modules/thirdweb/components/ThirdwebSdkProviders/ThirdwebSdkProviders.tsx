"use client";

import { ThirdwebProvider } from "thirdweb/react";

export function ThirdwebSdkProviders({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
}
