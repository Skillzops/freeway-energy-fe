import { CardComponent } from "../CardComponents/CardComponent";
import { useNavigate } from "react-router-dom";

const InventoryDetails = ({ inventoryData }: {inventoryData: any[];}) => {
  const _navigate = useNavigate();

  // Debug: Log the inventory data to console
  console.log("InventoryDetails - inventoryData:", inventoryData);

  // Handle case when inventoryData is undefined or empty
  if (!inventoryData || inventoryData.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-32 text-gray-500">
        <p>No inventory items found for this product.</p>
      </div>);

  }

  return (
    <div className="flex items-center flex-wrap gap-4 md:gap-3 lg:gap-4 w-full">
      {inventoryData.map((inventory, index) =>
      <CardComponent
        key={inventory?.id || index}
        variant="inventoryOne"
        productImage={inventory.productImage}
        productName={inventory.productName}
        productPrice={`Qty: ${inventory.quantity || 0}`}
        quantity={inventory.quantity}
        totalRemainingQuantities={inventory.totalRemainingQuantities}
        showDropdown={false} />

      )}
    </div>);

};

export default InventoryDetails;
