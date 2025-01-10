"use client";

import { useEffect, useState } from "react";
// import { NFTCard } from "./NFTCard";
import NFTCard from "./NFTCardV2";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export interface Collectible {
  id: number;
  image?: string;
  owner?: string;
  uri?: string;
}

export const MyNfts = () => {
  const { address: connectedAddress } = useAccount();
  const [myNfts, setMyNfts] = useState<(Collectible | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: monadLogoNFTContract } = useScaffoldContract({
    contractName: "MonadLogoNFT",
  });

  const { data: balance } = useScaffoldReadContract({
    contractName: "MonadLogoNFT",
    functionName: "balanceOf",
    args: [connectedAddress],
    watch: true,
  });

  useEffect(() => {
    const updateMyNfts = async (): Promise<void> => {
      if (!monadLogoNFTContract || !balance || !connectedAddress || isLoading) return;
      
      setIsLoading(true);
      
      try {
        const totalBalance = parseInt(balance.toString());
        setMyNfts(new Array(totalBalance).fill(null));
        
        const batchSize = 10;
        
        for (let i = 0; i < totalBalance; i += batchSize) {
          const batch = Array.from(
            { length: Math.min(batchSize, totalBalance - i) }, 
            (_, index) => i + index
          );
          
          try {
            await Promise.all(
              batch.map(async tokenIndex => {
                try {
                  const tokenId = await monadLogoNFTContract.read.tokenOfOwnerByIndex([
                    connectedAddress, 
                    BigInt(tokenIndex)
                  ]);
                  
                  setMyNfts(prev => {
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

    updateMyNfts();
  }, [connectedAddress, balance]);

  return (
    <>
      <div className="flex justify-center items-center space-x-2 flex-row">
        <p className="y-2 mr-2 font-bold text-2xl my-2">Your Logos:</p>
        <p className="text-xl">{balance ? balance.toString() : 0}</p>
      </div>
      {myNfts.length > 0 && (
        <div className="flex flex-wrap gap-4 my-8 px-5 justify-center">
          {myNfts.map((item, index) => (
            <NFTCard 
              tokenId={item?.id ?? index}
              key={item?.id ?? index}
              transfer={true}
            />
          ))}
        </div>
      )}
    </>
  );
};
