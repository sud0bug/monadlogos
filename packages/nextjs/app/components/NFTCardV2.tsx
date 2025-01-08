import { useEffect, useState } from "react";
import { Address, AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface NFTMetadata {
  uri?: string;
  owner?: string;
  image?: string;
  name?: string;
  color?: string;
}
// Add enum definition
enum FetchingState {
	NotLoaded = 'notloaded',
	Fetching = 'fetching',
	Loaded = 'loaded'
  }

export default function NFTCardV2({ tokenId, transfer = false }: { tokenId: number; transfer?: boolean }) {
  const [metadata, setMetadata] = useState<NFTMetadata>({});
  const [transferToAddress, setTransferToAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchingState, setFetchingState] = useState<FetchingState>(FetchingState.NotLoaded);

  const { data: monadLogoNFTContract } = useScaffoldContract({
    contractName: "MonadLogoNFT",
  });

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "MonadLogoNFT" });

  useEffect(() => {
    const fetchNFTData = async () => {
      if (!monadLogoNFTContract || fetchingState === FetchingState.Loaded || fetchingState === FetchingState.Fetching) return;

      try {
        // Fetch tokenURI and owner in parallel
        setFetchingState(FetchingState.Fetching);
        const [tokenURI, owner] = await Promise.all([
          monadLogoNFTContract.read.tokenURI([BigInt(tokenId)]),
          monadLogoNFTContract.read.ownerOf([BigInt(tokenId)])
        ]);

        setMetadata(prev => ({ ...prev, uri: tokenURI, owner }));
        setFetchingState(FetchingState.Loaded);
        // Fetch metadata separately
        try {
          const tokenMetadata = await fetch(tokenURI);
          const data = await tokenMetadata.json();
          setMetadata(prev => ({
            ...prev,
            image: data.image,
            name: data.name,
            color: JSON.parse(atob(tokenURI.replace('data:application/json;base64,', ''))).attributes[0].value
          }));
        } catch (e) {
          console.log("Error fetching metadata:", e);
          notification.error("Error fetching NFT metadata");
        }
      } catch (e) {
        console.log("Error fetching NFT data:", e);
        notification.error(`Error fetching NFT #${tokenId}`);
      } finally {
        setIsLoading(false);
        setFetchingState(FetchingState.Loaded);
      }
    };

    fetchNFTData();
  }, [tokenId, monadLogoNFTContract]);

  if (isLoading && !metadata.uri) {
    return (
      <div className="card card-compact bg-base-100 shadow-lg w-[300px] animate-pulse">
        <figure className="relative">
			<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NDAiIGhlaWdodD0iNjQwIiB2aWV3Qm94PSItMiAtMiAzNiAzNiIgZmlsbD0ibm9uZSI+PHN0eWxlPkBrZXlmcmFtZXMgZmFkZXswJXtvcGFjaXR5OjAuMzt9NTAle29wYWNpdHk6MC4yO30xMDAle29wYWNpdHk6MC4zO319LmxvYWRpbmctcGF0aHthbmltYXRpb246ZmFkZSAxLjVzIGluZmluaXRlO308L3N0eWxlPjxwYXRoIGNsYXNzPSJsb2FkaW5nLXBhdGgiIGQ9Ik0xNS45OTk5IDBDMTEuMzc5NSAwIDAgMTEuMzc5MiAwIDE1Ljk5OTlDMCAyMC42MjA2IDExLjM3OTUgMzIgMTUuOTk5OSAzMkMyMC42MjAzIDMyIDMyIDIwLjYyMDQgMzIgMTUuOTk5OUMzMiAxMS4zNzk0IDIwLjYyMDUgMCAxNS45OTk5IDBaTTEzLjUwNjYgMjUuMTQ5MkMxMS41NTgyIDI0LjYxODMgNi4zMTk4MSAxNS40NTUgNi44NTA4MyAxMy41MDY2QzcuMzgxODUgMTEuNTU4MSAxNi41NDUgNi4zMTk3OSAxOC40OTMzIDYuODUwOEMyMC40NDE4IDcuMzgxNzMgMjUuNjgwMiAxNi41NDQ5IDI1LjE0OTIgMTguNDkzNEMyNC42MTgyIDIwLjQ0MTggMTUuNDU1IDI1LjY4MDIgMTMuNTA2NiAyNS4xNDkyWiIgZmlsbD0iI2QzZDNkMyIvPjwvc3ZnPg==" alt="NFT Image" className="h-60 min-w-full" />
        </figure>
        <div className="card-body space-y-3">
          <div className="flex space-x-3 mt-1 items-center">
            <span className="h-4 bg-gray-300 rounded w-14" />
            <div className="h-4 bg-gray-300 rounded w-28" />
          </div>
          <div className="flex space-x-3 mt-1 items-center">
            <span className="h-4 bg-gray-300 rounded w-14" />
            <div className="h-4 bg-gray-300 rounded w-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-compact bg-base-100 shadow-lg w-[300px]">
      <figure className="relative">
        {metadata.image ? (
          <img src={metadata.image} alt="NFT Image" className="h-60 min-w-full" />
        ) : (
          <div className="h-60 w-full bg-gray-300 animate-pulse" />
        )}
        <figcaption className="glass absolute bottom-4 left-4 p-2 w-25 rounded-xl">
          <span># {tokenId}</span>
        </figcaption>
      </figure>
      <div className="card-body space-y-3">
        {!transfer && (
          <div className="flex space-x-3 mt-1 items-center">
            <span>Owner : </span>
            {metadata.owner ? (
              <Address address={metadata.owner} />
            ) : (
              <div className="h-4 bg-gray-300 rounded w-28 animate-pulse" />
            )}
          </div>
        )}
        <div className="flex space-x-3 mt-1 items-center">
          <span className="">Color : </span>
          <div className="flex items-center space-x-2">
            {metadata.color ? (
              <span className="font-semibold ms-0">{metadata.color}</span>
            ) : (
              <div className="h-4 bg-gray-300 rounded w-20 animate-pulse" />
            )}
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
                      args: [metadata.owner, transferToAddress, BigInt(tokenId.toString())],
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