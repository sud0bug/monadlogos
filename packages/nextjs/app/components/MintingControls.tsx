"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const MintingControls = () => {
  const [colorHex, setColorHex] = useState<string>(() => {
    // Generate random hex color
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    return randomColor;
  });

  const validateAndSetHex = (value: string) => {
    // Remove any spaces
    let hex = value.trim();
    
    // Add # if missing
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    
    // Check if it's exactly 7 characters (# + 6 hex digits)
    // and only contains valid hex characters (0-9, A-F) after #
    if (hex.length <= 7 && /^#[0-9A-F]*$/.test(hex.toUpperCase())) {
      setColorHex(hex);
    }
  };

  const validateHexCode = (hex: string): boolean => {
    // Remove any spaces and ensure # is present
    const formattedHex = hex.startsWith('#') ? hex : '#' + hex;
    // Check if it's exactly 7 characters (# + 6 hex digits)
    return formattedHex.length === 7 && /^#[0-9A-Fa-f]{6}$/.test(formattedHex);
  };

  const { writeContractAsync: writeMonadLogoNFTAsync } = useScaffoldWriteContract("MonadLogoNFT");

  return (
    <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mb-2">
      <div className="flex flex-row gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center input input ps-2 mt-2">
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 cursor-pointer"
            />
            <div
              className="w-8 h-8 rounded-2"
              style={{ backgroundColor: colorHex }}
            />
            <input
              type="text"
              value={colorHex}
              onChange={(e) => validateAndSetHex(e.target.value)}
              className="ml-2 bg-transparent border-none focus:outline-none w-24"
              placeholder="#000000"
            />
          </div>
        </div>
        
        <button
          className="btn btn-accent text-lg px-12 mt-2"
          disabled={!validateHexCode(colorHex)}
          onClick={async () => {await writeMonadLogoNFTAsync({ 
            functionName: "mint",
            args: [colorHex]
          });}}
        >
          Mint
        </button>
      </div>
      <span className="mt-2">or</span>

      <button
        className="btn btn-accent text-lg px-12 mt-2"
        onClick={async () => writeMonadLogoNFTAsync({ 
          functionName: "mintRandom"
        })}
      >
        Mint Random
      </button>
    </div>
  );
}; 