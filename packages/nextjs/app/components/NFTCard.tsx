import { useState } from "react";
import { Collectible } from "./MyNfts";
import { Address, AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const NFTCard = ({ nft, transfer, isLoading }: { nft: Collectible | null; transfer?: boolean; isLoading?: boolean }) => {
  const [transferToAddress, setTransferToAddress] = useState("");

  const { writeContractAsync } = useScaffoldWriteContract("MonadLogoNFT");

  if (isLoading || !nft) {
    return (
      <div className="card card-compact bg-base-100 shadow-lg w-[300px] animate-pulse">
        <figure className="relative">
          <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NDAiIGhlaWdodD0iNjQwIiB2aWV3Qm94PSItMiAtMiAzNiAzNiIgZmlsbD0ibm9uZSI+PHN0eWxlPkBrZXlmcmFtZXMgZmFkZXswJXtvcGFjaXR5OjAuMzt9NTAle29wYWNpdHk6MC4yO30xMDAle29wYWNpdHk6MC4zO319LmxvYWRpbmctcGF0aHthbmltYXRpb246ZmFkZSAxLjVzIGluZmluaXRlO308L3N0eWxlPjxwYXRoIGNsYXNzPSJsb2FkaW5nLXBhdGgiIGQ9Ik0xNS45OTk5IDBDMTEuMzc5NSAwIDAgMTEuMzc5MiAwIDE1Ljk5OTlDMCAyMC42MjA2IDExLjM3OTUgMzIgMTUuOTk5OSAzMkMyMC42MjAzIDMyIDMyIDIwLjYyMDQgMzIgMTUuOTk5OUMzMiAxMS4zNzk0IDIwLjYyMDUgMCAxNS45OTk5IDBaTTEzLjUwNjYgMjUuMTQ5MkMxMS41NTgyIDI0LjYxODMgNi4zMTk4MSAxNS40NTUgNi44NTA4MyAxMy41MDY2QzcuMzgxODUgMTEuNTU4MSAxNi41NDUgNi4zMTk3OSAxOC40OTMzIDYuODUwOEMyMC40NDE4IDcuMzgxNzMgMjUuNjgwMiAxNi41NDQ5IDI1LjE0OTIgMTguNDkzNEMyNC42MTgyIDIwLjQ0MTggMTUuNDU1IDI1LjY4MDIgMTMuNTA2NiAyNS4xNDkyWiIgZmlsbD0iI2QzZDNkMyIvPjwvc3ZnPg==" alt="NFT Image" className="h-60 min-w-full" />
        </figure>
        <div className="card-body space-y-3">
          <div className="flex space-x-3 mt-1 items-center">
            <span className="h-4 bg-gray-300 rounded w-14" /> {/* "Owner : " placeholder */}
            <div className="h-4 bg-gray-300 rounded w-28" /> {/* Address placeholder */}
          </div>
          <div className="flex space-x-3 mt-1 items-center">
            <span className="h-4 bg-gray-300 rounded w-14" /> {/* "Color : " placeholder */}
            <div className="h-4 bg-gray-300 rounded w-20" /> {/* Color value placeholder */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-compact bg-base-100 shadow-lg w-[300px]">
      <figure className="relative">
        {/* eslint-disable-next-line  */}
        <img src={nft.image} alt="NFT Image" className="h-60 min-w-full" />
        <figcaption className="glass absolute bottom-4 left-4 p-2 w-25 rounded-xl">
          <span># {nft.id}</span>
        </figcaption>
      </figure>
      <div className="card-body space-y-3">
        {!transfer && <div className="flex space-x-3 mt-1 items-center">
          <span>Owner : </span>
          <Address address={nft.owner} />
        </div>}
        <div className="flex space-x-3 mt-1 items-center">
          <span className="">Color : </span>
          <div className="flex items-center space-x-2">
            <span className="font-semibold ms-0">
              {JSON.parse(atob(nft.uri.replace('data:application/json;base64,', ''))).attributes[0].value}
            </span>
          </div>
        </div>
        {transfer && (
          <>
            <span className="mb-1">Transfer To: </span>
            <div className="join w-full">
              <AddressInput
                value={transferToAddress}
                placeholder="receiver address"
                onChange={newValue => setTransferToAddress(newValue)}
                onSubmit={() => {
                  try {
                    writeContractAsync({
                      functionName: "transferFrom",
                      args: [nft.owner, transferToAddress, BigInt(nft.id.toString())],
                    });
                  } catch (err) {
                    console.error("Error calling transferFrom function");
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
