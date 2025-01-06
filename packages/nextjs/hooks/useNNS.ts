import { useEffect, useState } from "react";
import { NNS } from "@nadnameservice/nns-viem-sdk";
import { createPublicClient, http } from "viem";
import { monadDevnet } from "~~/utils/customChains";

const publicClient = createPublicClient({
    chain: monadDevnet,
    transport: http("https://devnet1.monad.xyz/rpc/8XQAiNSsPCrIdVttyeFLC6StgvRNTdf"),
    batch: {
      multicall: true
    }
}) as any; // Temporary type assertion to bypass strict typing

export const useNNS = (address: string | undefined) => {
  const [name, setName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);  

  useEffect(() => {
    const fetchNNSData = async () => {
      if (!address) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const nns = new NNS(publicClient);

        // Get primary name for the address
        const primaryName = await nns.getPrimaryNameForAddress(address);
		if(primaryName) {
			setName(`${primaryName}.nad`);
		}
        
        if (primaryName) {
          // Get avatar if name exists
          const avatarRecord = await nns.getAvatarUrl(`${primaryName}.nad`);
          setAvatar(avatarRecord);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch NNS data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNNSData();
  }, [address, publicClient]);

  return {
    name,
    avatar,
    isLoading,
    error,
  };
};
