"use client";

import { useState } from "react";
import { AllNfts } from "./components/AllNfts";
import { MyNfts } from "./components/MyNfts";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { AddressInput, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import MovingBackground from "./components/MovingBackground";
import { MintingControls } from "./components/MintingControls";

const ERC721: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow relative z-10">
        {connectedAddress ? (
          <div className="flex flex-col justify-center items-center bg-base-300 w-full px-8 pt-6 pb-12">
            <MintingControls />
            <MyNfts />
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center bg-base-300 w-full px-8 pt-6 pb-12">
            <p className="text-xl font-bold">Please connect your wallet to mint Monad logos.</p>
            <RainbowKitCustomConnectButton />
          </div>
        )}
        <AllNfts />
      </div>
    </>
  );
};

export default ERC721;
