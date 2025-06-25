import { TitlePill } from "../TitlePillComponent/TitlePill";
import inventorygradient from "../../assets/inventory/inventorygradient.svg";
import stockgreen from "../../assets/inventory/stockvalue.svg";
import giftgradient from "../../assets/inventory/gift.svg";
import { NairaSymbol } from "../CardComponents/CardComponent";

const InventoryStats = ({
  stats,
}: {
  stats: {
    allTimeStockNumber: number;
    totalStockAvailable: number;
    totalValueStockAvailable: number;
    totalBatchesCreated: number;
    percentageAvailable: string;
  };
}) => {
  return (
    <div className="flex flex-col w-full gap-4">
      <TitlePill
        icon={inventorygradient}
        iconBgColor="bg-[#FDEEC2]"
        topText="Total Initial Quantities of"
        bottomText="STOCK"
        value={stats?.allTimeStockNumber}
        parentClass="w-full"
      />

      <TitlePill
        icon={inventorygradient}
        iconBgColor="bg-[#FDEEC2]"
        topText="Total Remaining Quantities of"
        bottomText="STOCK"
        value={stats?.totalStockAvailable}
        parentClass="w-full"
      />
      <TitlePill
        icon={stockgreen}
        iconBgColor="bg-[#E3FAD6]"
        topText="Total Value of Available"
        bottomText="STOCK"
        leftIcon={<NairaSymbol />}
        value={stats?.totalValueStockAvailable}
        parentClass="w-full"
      />
      <TitlePill
        icon={inventorygradient}
        iconBgColor="bg-[#FDEEC2]"
        topText="Current Available (in percentage)"
        bottomText="BATCH"
        value={stats?.percentageAvailable}
        parentClass="w-full"
      />
      <TitlePill
        icon={giftgradient}
        iconBgColor="bg-[#FDEEC2]"
        topText="Total Created"
        bottomText="BATCHES"
        value={stats?.totalBatchesCreated}
        parentClass="w-full"
      />
    </div>
  );
};

export default InventoryStats;
