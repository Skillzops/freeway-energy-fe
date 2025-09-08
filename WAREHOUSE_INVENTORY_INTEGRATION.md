# Warehouse-Inventory Integration Guide

This document explains how to add inventory to warehouses and properly link the inventory system with the warehouse system.

## 🔗 How Inventory Links to Warehouses

### 1. **Warehouse-Inventory Relationship**
Each inventory item is linked to a warehouse through the `warehouseId` field:

```javascript
// Inventory item structure
{
  id: "inv-001",
  name: "Solar Panel 300W",
  warehouseId: "warehouse-main", // Links to warehouse
  quantity: 50,
  unitPrice: 25000,
  category: "solar",
  // ... other fields
}
```

### 2. **API Integration Pattern**

#### Get Inventory for Specific Warehouse:
```javascript
// Get all inventory items for a warehouse
GET /v1/inventory?warehouseId=warehouse-main

// Usage in components:
const { data: inventory } = useWarehouseInventory(warehouseId);
```

#### Add Inventory to Warehouse:
```javascript
// Create inventory item assigned to warehouse
POST /v1/inventory/create
{
  "name": "Solar Panel 300W",
  "warehouseId": "warehouse-main",
  "quantity": 50,
  "unitPrice": 25000,
  "category": "solar"
}
```

## 📋 How to Add Inventory to Warehouses

### Method 1: Using AddInventoryToWarehouseModal Component

```javascript
import { AddInventoryToWarehouseModal } from '../Components/WareHouses/AddInventoryToWarehouseModal';

// In your component:
const [addInventoryOpen, setAddInventoryOpen] = useState(false);

// Add button in warehouse detail view:
<button onClick={() => setAddInventoryOpen(true)}>
  Add Inventory
</button>

// Modal component:
<AddInventoryToWarehouseModal
  open={addInventoryOpen}
  onOpenChange={setAddInventoryOpen}
  warehouseId={warehouse.id}
  onSuccess={() => {
    // Refresh inventory data
    mutateInventory();
  }}
/>
```

### Method 2: Using Inventory API Directly

```javascript
import { useInventoryApi } from '../services/inventoryApi';

const { createInventoryItem } = useInventoryApi();

const addInventoryToWarehouse = async (warehouseId: string, inventoryData: any) => {
  try {
    await createInventoryItem({
      ...inventoryData,
      warehouseId: warehouseId, // Critical: Link to warehouse
    });
    toast.success('Inventory added to warehouse successfully');
  } catch (error) {
    toast.error('Failed to add inventory to warehouse');
  }
};
```

## 🔧 API Endpoints for Warehouse-Inventory Operations

### Core Inventory Operations:
- `POST /v1/inventory/create` - Create inventory item (include warehouseId)
- `GET /v1/inventory?warehouseId={id}` - Get warehouse inventory
- `GET /v1/inventory/{id}` - Get specific inventory item
- `GET /v1/inventory/stats` - Get inventory statistics

### Batch Operations:
- `POST /v1/inventory/batch/create` - Create multiple items at once
- `GET /v1/inventory/batch/{id}` - Get batch details

### Category Management:
- `GET /v1/inventory/categories/all` - Get all categories
- `POST /v1/inventory/category/create` - Create new category

## 🏗️ Implementation in Components

### 1. **WarehouseDetail Component**
```javascript
// Get inventory for specific warehouse
const { data: inventory, mutate: mutateInventory } = useWarehouseInventory(warehouseId);

// Display inventory with warehouse context
const inventoryArray = Array.isArray(inventory) ? inventory : [];
const totalItems = inventoryArray.reduce((sum, item) => sum + item.quantity, 0);
```

### 2. **Inventory Management Hook**
```javascript
// Enhanced hook for warehouse-specific inventory
export const useWarehouseInventoryManagement = (warehouseId: string) => {
  const { data: inventory = [], mutate } = useWarehouseInventory(warehouseId);
  const { createInventoryItem } = useInventoryApi();

  const addInventoryToWarehouse = async (inventoryData: any) => {
    await createInventoryItem({
      ...inventoryData,
      warehouseId: warehouseId,
    });
    await mutate(); // Refresh warehouse inventory
  };

  return {
    inventory: Array.isArray(inventory) ? inventory : [],
    addInventoryToWarehouse,
    refreshInventory: mutate,
  };
};
```

## 📊 Data Flow

### Adding Inventory to Warehouse:
1. **User selects warehouse** → Component gets `warehouseId`
2. **User fills inventory form** → Form includes warehouse assignment
3. **API call made** → `POST /v1/inventory/create` with `warehouseId`
4. **Data refreshed** → Warehouse inventory list updates automatically

### Viewing Warehouse Inventory:
1. **Component loads** → Calls `useWarehouseInventory(warehouseId)`
2. **API fetches data** → `GET /v1/inventory?warehouseId={id}`
3. **Data processed** → Array safety checks applied
4. **UI renders** → Inventory displayed for specific warehouse

## 🔄 Transfer Requests Integration

### Inventory Transfer Between Warehouses:
```javascript
// Create transfer request
POST /v1/warehouses/transfer-requests
{
  "fromWarehouse": "warehouse-main",
  "toWarehouse": "warehouse-branch",
  "productId": "inv-001", // Inventory item ID
  "requestedQuantity": 10
}

// When fulfilled, inventory quantities update automatically
```

## 🎯 Key Integration Points

### 1. **Warehouse Selection in Forms**
Always include warehouse selection when adding inventory:
```javascript
<select value={warehouseId} onChange={setWarehouseId}>
  {warehouses.map(warehouse => (
    <option key={warehouse.id} value={warehouse.id}>
      {warehouse.name} - {warehouse.location}
    </option>
  ))}
</select>
```

### 2. **Inventory Display in Warehouse Views**
Filter inventory by warehouse:
```javascript
// Get inventory for specific warehouse
const warehouseInventory = useWarehouseInventory(warehouseId);

// Display in warehouse detail view
<InventoryTable inventory={warehouseInventory.data} />
```

### 3. **Statistics and Metrics**
Calculate warehouse-specific metrics:
```javascript
const warehouseMetrics = {
  totalItems: inventory.reduce((sum, item) => sum + item.quantity, 0),
  totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
  lowStockItems: inventory.filter(item => item.quantity <= item.minStockLevel).length,
  categories: [...new Set(inventory.map(item => item.category))].length,
};
```

## 🚀 Usage Examples

### Complete Warehouse-Inventory Workflow:

```javascript
// 1. Create warehouse
const newWarehouse = await createWarehouse({
  name: "Lagos Branch",
  location: "Victoria Island",
  isMainWarehouse: false
});

// 2. Add inventory to warehouse
const inventoryItem = await createInventoryItem({
  name: "Solar Panel 300W",
  warehouseId: newWarehouse.id,
  quantity: 100,
  unitPrice: 25000,
  category: "solar",
  minStockLevel: 10,
  maxStockLevel: 200
});

// 3. View warehouse inventory
const warehouseInventory = useWarehouseInventory(newWarehouse.id);

// 4. Create transfer request
const transferRequest = await createTransferRequest({
  fromWarehouse: "warehouse-main",
  toWarehouse: newWarehouse.id,
  productId: inventoryItem.id,
  requestedQuantity: 20
});
```

This integration provides a complete warehouse-inventory management system where inventory items are properly linked to warehouses and can be managed, transferred, and tracked across the entire warehouse network.