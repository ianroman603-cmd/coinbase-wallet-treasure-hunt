"use client";
import { MediaRenderer, useActiveAccount, useConnectModal } from "thirdweb/react";
import { client } from "~/providers/Thirdweb";
import styles from "./styles.module.css";
import { api } from "~/utils/api";
import { useState } from "react";
import { createWallet } from "thirdweb/wallets";
import { base } from "thirdweb/chains";

interface ClaimTreasureProps {
  title?: string;
  poster?: string;
  mediaSrc?: string;
  uniqueName: string;
  amount: string;
  chainId: number;
}

function ClaimTreasure({ 
  mediaSrc = "https://mochithecatcoin.com/img/hero/cat.png",
  poster,
  title = "Treasure Coming Soon!",
  uniqueName,
  amount,
  chainId,
}: ClaimTreasureProps) {

  const account = useActiveAccount();
  const { connect } = useConnectModal();

  const [isClaimLoading, setIsClaimLoading] = useState<boolean>(false);

  const { 
    data: isTreasureClaimed, 
    isLoading: isTreasureClaimedLoading,
    refetch: refetchIsTreasureClaimed,
  } = api.treasures.getIsTreasureClaimed.useQuery({
    chainId,
    uniqueName,
    amount,
  });

  const { 
    mutateAsync: claim,
  } = api.treasures.claimTreasure.useMutation();

  const handleClaim = async () => {
    if (!account) return;
    setIsClaimLoading(true);
    try {
      const receipt = await claim({ 
        chainId, uniqueName, amount, recipient: account.address 
      });
      console.log({ receipt });
      await refetchIsTreasureClaimed();
    } catch (error) {
      console.error(error);
    } finally {
      setIsClaimLoading(false);
    }
  }

  return (
    <div className={`flex flex-col items-center gap-2 rounded-lg ${styles.media} ${isTreasureClaimedLoading ? 'animate-pulse' : ''}`} >
      <h3>{title}</h3>
      {amount} $MOCHI
      <div className="relative media">
        <MediaRenderer
          src={mediaSrc}
          poster={poster ?? undefined}
          className={`${isTreasureClaimed ? 'opacity-50' : ''}`}
          client={client}
          width={"100%"}
          height={"100%"}
          alt="Treasure"
          controls={false}
        />
        {isTreasureClaimed ? (
          <div className="absolute top-0 left-0 w-full h-full grid place-content-center">
            <div className="bg-[#F56222] text-white w-fit rounded-lg p-2 ">
              <p>Claimed!</p>
            </div>
          </div>
        ) : (
          <div className="absolute top-0 left-0 w-full h-full grid place-content-center">
            <div 
              className={`bg-[#F56222] text-white ${isClaimLoading ? 'animate-pulse cursor-not-allowed' : 'cursor-pointer'} w-fit rounded-lg p-2`}
              onClick={async () => {
                if (!account) {
                  return await connect({ 
                    client,
                    recommendedWallets: [createWallet("com.coinbase.wallet")],
                    wallets: [createWallet("com.coinbase.wallet")],
                    theme: "light",
                    chain: base,
                  });
                }
                if (isClaimLoading) return;
                await handleClaim();
              }}
            >
              {!account ? 'Connect your wallet to claim!' : isClaimLoading ? 'Claiming...' : 'Claim'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClaimTreasure;
