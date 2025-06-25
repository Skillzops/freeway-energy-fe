import { CardComponent } from "../CardComponents/CardComponent";
import { useNavigate } from "react-router-dom";

const InventoryDetails = ({ inventoryData }: { inventoryData: any[] }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center flex-wrap gap-4 md:gap-3 lg:gap-4 w-full">
      {inventoryData?.map((inventory, index) => (
        <CardComponent
          key={index}
          variant="inventoryOne"
          dropDownList={{
            items: ["View Inventory"],
            onClickLink: () => {
              navigate(`/inventory/all?inventoryId=${inventory?.id}`);
            },
            defaultStyle: true,
            showCustomButton: true,
          }}
          productImage={inventory.productImage}
          productName={inventory.productName}
          productPrice={inventory.productPrice}
          quantity={inventory.quantity}
        />
      ))}
    </div>
  );
};

export default InventoryDetails;
