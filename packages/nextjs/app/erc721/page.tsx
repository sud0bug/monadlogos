"use client";

import { useState } from "react";
import { AllNfts } from "./components/AllNfts";
import { MyNfts } from "./components/MyNfts";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { AddressInput, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const ERC721: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const [toAddress, setToAddress] = useState<string>("");

  const { writeContractAsync: writeMonadLogoNFTAsync } = useScaffoldWriteContract("MonadLogoNFT");

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">

        {connectedAddress ? (
          <div className="flex flex-col justify-center items-center bg-base-300 w-full mt-8 px-8 pt-6 pb-12">
            <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mb-2">
              <button
                className="btn btn-accent text-lg px-12 mt-2"
                onClick={async () => {
                  try {
                    await writeMonadLogoNFTAsync({ functionName: "mintRandom" });
                  } catch (e) {
                    console.error("Error while minting token", e);
                  }
                }}
              >
                Mint
              </button>
            </div>
            <MyNfts />
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center bg-base-300 w-full mt-8 px-8 pt-6 pb-12">
            <p className="text-xl font-bold">Please connect your wallet to interact with the token.</p>
            <RainbowKitCustomConnectButton />
          </div>
        )}
        <AllNfts />
      </div>
    </>
  );
};

export default ERC721;
