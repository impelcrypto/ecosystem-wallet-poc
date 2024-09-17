"use client";

import { Transfer } from "@/modules/demo/components/Transfer/Transfer";

import { useEffect, useState } from "react";

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return <main>{isClient && <Transfer />}</main>;
}
