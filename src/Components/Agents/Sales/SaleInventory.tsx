import { CardComponent } from "../CardComponents/CardComponent";

const SaleInventory = ({ data }: { data: any }) => {
  return (
    <div className={`flex flex-wrap justify-start items-center h-full gap-4`}>
      {data?.length > 0 ? (
        data?.map((item: any, index: number) => (
          <CardComponent
            key={index}
            variant={"inventoryTwo"}
            productId={data.productId}
            productImage={item?.inventory?.image}
            productTag={item?.inventory?.manufacturerName}
            productName={item?.inventory?.name}
            productPrice={""}
            productUnits={item?.quantity}
            totalRemainingQuantities={item?.quantity}
            noAction={true}
          />
        ))
      ) : (
        <p>No Inventory Available</p>
      )}
    </div>
  );
};

export default SaleInventory;
