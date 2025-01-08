"use client";

import { useEffect, useState } from "react";
import NFTCard from "./NFTCardV2";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useInView } from "react-intersection-observer";

export interface Collectible {
  id: number;
}

export const AllNfts = () => {
  const [allNfts, setAllNfts] = useState<(Collectible | null)[]>([]);
  const [loadedCount, setLoadedCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();

  const { data: monadLogoNFTContract } = useScaffoldContract({
    contractName: "MonadLogoNFT",
  });

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "MonadLogoNFT",
    functionName: "totalSupply",
    watch: true,
  });

  const fetchNFTs = async (startIndex: number, count: number): Promise<void> => {
    if (!monadLogoNFTContract || !totalSupply || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const total = parseInt(totalSupply.toString());
      const batchSize = 10;
      const endIndex = Math.max(0, startIndex - count);
      
      for (let i = startIndex; i >= endIndex; i -= batchSize) {
        const batch = Array.from(
          { length: Math.min(batchSize, i + 1) }, 
          (_, index) => i - index
        );
        
        try {
          await Promise.all(
            batch.map(async tokenIndex => {
              try {
                const tokenId = await monadLogoNFTContract.read.tokenByIndex([BigInt(tokenIndex)]);
                
                setAllNfts(prev => {
                  const updated = [...prev];
                  updated[tokenIndex] = {
                    id: parseInt(tokenId.toString())
                  };
                  return updated;
                });
              } catch (e) {
                console.log(e);
                notification.error(`Error fetching NFT #${tokenIndex}`);
              }
            })
          );
        } catch (e) {
          console.log(e);
          notification.error("Error processing NFT batch");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (totalSupply) {
      const total = parseInt(totalSupply.toString());
      setAllNfts(new Array(total).fill(null));
      fetchNFTs(total - 1, 10);
    }
  }, [totalSupply]);

  useEffect(() => {
    if (inView && totalSupply && !isLoading) {
      const total = parseInt(totalSupply.toString());
      const nextBatch = Math.min(loadedCount + 10, total);
      if (loadedCount < total) {
        fetchNFTs(total - loadedCount - 1, 10);
        setLoadedCount(nextBatch);
      }
    }
  }, [inView, totalSupply, loadedCount, isLoading]);

  return (
    <>
      <div className="flex justify-center items-center space-x-2 flex-row">
        <p className="y-2 mr-2 font-bold text-2xl my-2">Supply:</p>
        <p className="text-xl">{totalSupply ? totalSupply.toString() : 0}</p>
      </div>
      
      <div className="flex flex-wrap gap-4 my-8 px-5 justify-center">
        {[...allNfts].reverse().slice(0, loadedCount).map((item, index) => (
          <NFTCard 
            tokenId={item?.id ?? Number(totalSupply) - (index+1)} 
            key={item?.id ?? Number(totalSupply) - (index+1)} 
          />
        ))}
      </div>
      
      <div ref={ref} className="h-10 w-full" />
    </>
  );
};
