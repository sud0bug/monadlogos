import { defineChain } from "viem";

// TODO: Add Chain details here.
export const monadDevnet = defineChain({
  id: 20143,
  name: "Monad Devnet",
  nativeCurrency: { name: "Monad Devnet", symbol: "DMON", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Devnet Blockscout",
      url: "https://explorer.monad-devnet.devnet101.com/",
    },
  },
});