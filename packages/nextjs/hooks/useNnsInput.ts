import { useEffect, useState } from "react";
import { NNS } from "@nadnameservice/nns-viem-sdk";
import { createPublicClient, http, isAddress } from "viem";
import { monadDevnet } from "~~/utils/customChains";

const publicClient = createPublicClient({
  chain: monadDevnet,
  transport: http("https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a"),
  batch: {
    multicall: true
  }
}) as any;

interface NnsInputResult {
  address: string | null;
  name: string | null;
  avatar: string | null;
  isLoading: boolean;
  error: Error | null;
}

export const useNnsInput = (input: string | undefined): NnsInputResult => {
  const [result, setResult] = useState<NnsInputResult>({
    address: null,
    name: null,
    avatar: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const resolveInput = async () => {
      if (!input) {
        setResult({ address: null, name: null, avatar: null, isLoading: false, error: null });
        return;
      }

      setResult(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const nns = new NNS(publicClient);

        // Case 1: Input is an address
        if (isAddress(input)) {
          const [name, avatar] = await Promise.all([
            nns.getPrimaryNameForAddress(input),
            nns.getAvatarUrl(input)
          ]);

          setResult({
            address: input,
            name: name ? `${name}.nad` : null,
            avatar: avatar || null,
            isLoading: false,
            error: null,
          });
          return;
        }

        // Case 2: Input is a NNS name
        const normalizedName = (input as string).toLowerCase().endsWith('.nad') 
          ? (input as string).toLowerCase()
          : `${(input as string).toLowerCase()}.nad`;

        const [address, avatar] = await Promise.all([
          nns.getResolvedAddress(normalizedName),
          nns.getAvatarUrl(normalizedName)
        ]);

        setResult({
          address: address || null,
          name: normalizedName,
          avatar: avatar || null,
          isLoading: false,
          error: null,
        });

      } catch (err) {
        setResult({
          address: null,
          name: null,
          avatar: null,
          isLoading: false,
          error: err instanceof Error ? err : new Error("Failed to resolve NNS input"),
        });
      }
    };

    resolveInput();
  }, [input]);

  return result;
}; 