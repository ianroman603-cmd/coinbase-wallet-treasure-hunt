"use client";
import { MediaRenderer } from "thirdweb/react";
import { client } from "~/providers/Thirdweb";
import styles from "./styles.module.css";
import { api } from "~/utils/api";

interface TreasureProps {
  title?: string;
  poster?: string;
  mediaSrc?: string;
  uniqueName: string;
  amount: string;
  chainId: number;
}

function Treasure({ 
  mediaSrc = "https://mochithecatcoin.com/img/hero/cat.png",
  poster,
  title = "Treasure Coming Soon!",
  uniqueName,
  amount,
  chainId,
}: TreasureProps) {

  const { 
    data: isTreasureClaimed, 
    isLoading 
  } = api.treasures.getIsTreasureClaimed.useQuery({
    chainId,
    uniqueName,
    amount,
  });

  return (
    <div className={`flex max-w-[285px] sm:max-w-sm flex-col items-center gap-2 rounded-lg ${styles.media} ${isLoading ? 'animate-pulse' : ''}`} >
      <h3>{title}</h3>
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
        {isTreasureClaimed && (
          <div className="absolute top-0 left-0 w-full h-full grid place-content-center">
            <div className="bg-[#F56222] text-white w-fit rounded-lg p-2 ">
              <p>Claimed!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Treasure;
