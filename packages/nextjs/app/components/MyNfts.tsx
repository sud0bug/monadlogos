"use client";

import { useEffect, useState } from "react";
import { NFTCard } from "./NFTCard";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export interface Collectible {
  id: number;
  uri: string;
  owner: string;
  image: string;
  name: string;
}

export const MyNfts = () => {
  const { address: connectedAddress } = useAccount();
  const [myNfts, setMyNfts] = useState<(Collectible | null)[]>([]);

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
      if (balance === undefined || monadLogoNFTContract === undefined || connectedAddress === undefined) return;

      const totalBalance = parseInt(balance.toString());
      setMyNfts(new Array(totalBalance).fill(null));
      
      const batchSize = 5;
      
      for (let i = 0; i < totalBalance; i += batchSize) {
        const batch = Array.from({ length: Math.min(batchSize, totalBalance - i) }, (_, index) => i + index);
        
        try {
          await Promise.all(
            batch.map(async tokenIndex => {
              try {
                const tokenId = await monadLogoNFTContract.read.tokenOfOwnerByIndex([connectedAddress, BigInt(tokenIndex)]);
                const tokenURI = await monadLogoNFTContract.read.tokenURI([tokenId]);
                
                const tokenMetadata = await fetch(tokenURI);
                const metadata = await tokenMetadata.json();
                
                setMyNfts(prev => {
                  const updated = [...prev];
                  updated[tokenIndex] = {
                    id: parseInt(tokenId.toString()),
                    uri: tokenURI,
                    owner: connectedAddress,
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

    updateMyNfts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            nft={item} 
            key={item?.id ?? index} 
            isLoading={!item}
            transfer={true} 
            />
          ))}
        </div>
      )}
    </>
  );
};
