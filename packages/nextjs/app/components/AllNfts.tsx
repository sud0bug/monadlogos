"use client";

import { useEffect, useState } from "react";
import { NFTCard } from "./NFTCard";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export interface Collectible {
  id: number;
  uri: string;
  owner: string;
  image: string;
  name: string;
}

export const AllNfts = () => {
  const [allNfts, setAllNfts] = useState<(Collectible | null)[]>([]);

  const { data: monadLogoNFTContract } = useScaffoldContract({
    contractName: "MonadLogoNFT",
  });

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "MonadLogoNFT",
    functionName: "totalSupply",
    watch: true,
  });

  const fetchNFTs = async (): Promise<void> => {
    if (!monadLogoNFTContract || !totalSupply) return;
    
    const total = parseInt(totalSupply.toString());
    const batchSize = 10;
    
    for (let i = total - 1; i >= 0; i -= batchSize) {
      const batch = Array.from(
        { length: Math.min(batchSize, i + 1) }, 
        (_, index) => i - index
      );
      
      try {
        // Process batch of tokens concurrently, but wait for each batch to complete
        await Promise.all(
          batch.map(async tokenIndex => {
            try {
              const tokenId = await monadLogoNFTContract.read.tokenByIndex([BigInt(tokenIndex)]);
              
              const [tokenURI, owner] = await Promise.all([
                monadLogoNFTContract.read.tokenURI([tokenId]),
                monadLogoNFTContract.read.ownerOf([tokenId])
              ]);
              
              const tokenMetadata = await fetch(tokenURI);
              const metadata = await tokenMetadata.json();
              
              setAllNfts(prev => {
                const updated = [...prev];
                updated[tokenIndex] = {
                  id: parseInt(tokenId.toString()),
                  uri: tokenURI,
                  owner,
                  image: metadata.image,
                  name: metadata.name,
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
  };

  useEffect(() => {
    if (totalSupply) {
      const total = parseInt(totalSupply.toString());
      setAllNfts(new Array(total).fill(null));
      fetchNFTs();
    }
  }, [totalSupply]);

  return (
    <>
      <div className="flex justify-center items-center space-x-2 flex-row">
        <p className="y-2 mr-2 font-bold text-2xl my-2">Supply:</p>
        <p className="text-xl">{totalSupply ? totalSupply.toString() : 0}</p>
      </div>
      
      <div className="flex flex-wrap gap-4 my-8 px-5 justify-center">
        {[...allNfts].reverse().map((item, index) => (
          <NFTCard 
            nft={item} 
            key={item?.id ?? Number(totalSupply) - (index+1)} 
            isLoading={!item} 
          />
        ))}
      </div>
    </>
  );
};
