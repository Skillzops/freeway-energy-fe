import solarpanel from "../../assets/table/solar-panel.png";
import inverters from "../../assets/table/inverter.jpg";
import batteries from "../../assets/table/battery.avif";
import controllers from "../../assets/table/controllers.avif";
import accessories from "../../assets/table/accessory.avif";

export type Entry = {
  no: number;
  name: string;
  email: string;
  location: string;
  product: string;
  status: string;
};

// Helper function to get random values
const getRandomItem = (items: any[]) =>
  items[Math.floor(Math.random() * items.length)];

// Generate 'n' random entries
export const generateCustomerEntries = (count: number): Entry[] => {
  const names = ["Naomi Gambo", "John Doe", "Mary Jane", "David Smith"];
  const emails = [
    "naomigambo@gmail.com",
    "johndoe@gmail.com",
    "maryjane@gmail.com",
    "davidsmith@gmail.com",
  ];
  const locations = ["Asaba", "Lagos", "Abuja", "Makurdi"];
  const products = ["01", "02", "03", "04"];
  const statuses = [
    "DUE: SEPT 11 2024",
    "NONE",
    "DEFAULTED: 29 DAYS",
    "COMPLETED",
  ];

  const entries: Entry[] = [];

  for (let i = 1; i <= count; i++) {
    entries.push({
      no: i,
      name: getRandomItem(names),
      email: getRandomItem(emails),
      location: getRandomItem(locations),
      product: getRandomItem(products),
      status: getRandomItem(statuses),
    });
  }

  return entries;
};

type EntryThree = {
  no: number;
  name: string;
  email: string;
  location: string;
  role: string;
  status: string;
};

// Generate 'n' random entries
export const generateUserEntries = (count: number): EntryThree[] => {
  const names = ["Naomi Gambo", "John Doe", "Mary Jane", "David Smith"];
  const emails = [
    "naomigambo@gmail.com",
    "johndoe@gmail.com",
    "maryjane@gmail.com",
    "davidsmith@gmail.com",
  ];
  const locations = ["Asaba", "Lagos", "Abuja", "Makurdi"];
  const roles = [
    "Super Admin",
    "Admin",
    "Support",
    "Inventory",
    "Account",
    "Sales",
  ];
  const statuses = ["ACTIVE", "INACTIVE"];

  const entries: EntryThree[] = [];

  for (let i = 1; i <= count; i++) {
    entries.push({
      no: i,
      name: getRandomItem(names),
      email: getRandomItem(emails),
      location: getRandomItem(locations),
      role: getRandomItem(roles),
      status: getRandomItem(statuses),
    });
  }

  return entries;
};

interface ProductEntries {
  productId: number;
  productTag: string;
  productImage: string;
  productPrice: number;
  paymentModes: string[];
  datetime: string;
  name: string;
}

const names = [
  "Naomi Gambo",
  "John Doe",
  "Mary Jane",
  "David Smith",
  "Ahire Tersoo",
];
const productTags = ["EAAS", "SHS", "Rooftop"];
const productPrices = [1200000, 850000, 950000, 620000, 420000];
const paymentOptions = [
  ["One-Time", "Instalmental"],
  ["One-Time"],
  ["Instalmental"],
];
const images = [solarpanel, inverters, batteries, controllers, accessories];

// Helper function to generate a list of random product entries
export const generateRandomProductEntries = (
  count: number,
  filterTags?: string[]
): ProductEntries[] => {
  const entries: ProductEntries[] = [];

  for (let i = 1; i <= count; i++) {
    const entry = {
      productId: 100000 + i,
      productTag: getRandomItem(productTags),
      productImage: getRandomItem(images),
      productPrice: getRandomItem(productPrices),
      paymentModes: getRandomItem(paymentOptions),
      datetime: new Date().toISOString(),
      name: getRandomItem(names),
    };

    // Only add entry if it matches a tag in filterTags, or if no filter is applied
    if (!filterTags || filterTags.includes(entry.productTag)) {
      entries.push(entry);
    }
  }

  return entries;
};

export const generateRandomProductEntry = (): ProductEntries => {
  // Generate a single random product entry
  const productEntry: ProductEntries = {
    productId: 100000 + Math.floor(Math.random() * 1000),
    productTag: getRandomItem(productTags),
    productImage: getRandomItem(images),
    productPrice: getRandomItem(productPrices),
    paymentModes: getRandomItem(paymentOptions),
    datetime: new Date().toISOString(),
    name: getRandomItem(names),
  };

  return productEntry;
};

const productCategory = [
  "solarPanels",
  "inverters",
  "batteries",
  "chargeControllers",
  "accessories",
];

const solarPanels = [
  "SolarMax 2000",
  "EcoLite Panel",
  "SunPower Ultra",
  "Photon Pro",
  "EnergyStar Panel",
];

const inverter = [
  "VoltSwitch Pro",
  "PowerSync 500",
  "InverMax Prime",
  "WattWave Lite",
  "GridFlex Ultra",
];

const battery = [
  "LithiumCore X",
  "EnergyVault 3000",
  "PowerSafe Elite",
  "ChargeHub Max",
  "BatteryBank Pro",
];

const controller = [
  "SolarBrain X",
  "ChargeControl Max",
  "SunTrack Elite",
  "PowerFlow 400",
  "GridManager Pro",
];

const accessory = [
  "CableMaster Pro",
  "SolarMount Kit",
  "ConnectorFlex",
  "PanelClamp Set",
  "VoltageReg Ultra",
];

const productUnits = [10, 6, 12, 15, 18, 20];

type ProductInventoryType = {
  name: string;
  data: {
    productId: string | number;
    productImage: string;
    productTag: string;
    productName: string;
    productPrice: number;
    productUnits: number;
  }[];
};

const getRandomProductName = (name: string) => {
  switch (name) {
    case "solarPanels":
      return getRandomItem(solarPanels);
    case "inverters":
      return getRandomItem(inverter);
    case "batteries":
      return getRandomItem(battery);
    case "chargeControllers":
      return getRandomItem(controller);
    case "accessories":
      return getRandomItem(accessory);
    default:
      return "Undefined Product Name";
  }
};

const getRandomProductImage = (name: string) => {
  switch (name) {
    case "solarPanels":
      return solarpanel;
    case "inverters":
      return inverters;
    case "batteries":
      return batteries;
    case "chargeControllers":
      return controllers;
    case "accessories":
      return accessories;
    default:
      break;
  }
};

export const generateRandomProductInventoryEntries = (...counts: number[]) => {
  if (counts.length !== productCategory.length) {
    throw new Error(
      `Counts array length (${counts.length}) must match productCategory length (${productCategory.length})`
    );
  }

  const entries: ProductInventoryType[] = productCategory.map(
    (item, index) => ({
      name: item,
      data: Array.from({ length: counts[index] }, (_, i) => ({
        productId: 100000 + index * 1000 + i, // Generate unique IDs
        productImage: getRandomProductImage(item) || "",
        productTag: getRandomItem(["Lima", "Sigma"]),
        productName: getRandomProductName(item),
        productPrice: getRandomItem(productPrices),
        productUnits: getRandomItem(productUnits),
      })),
    })
  );

  return entries;
};

const getRandomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min)) + min;

interface InventoryEntries {
  no: number;
  name: { image: string; text: string };
  class: string;
  salePrice: number;
  inventoryValue: number;
  stockLevel: { totalUnits: number; currentUnits: number };
  deleted: boolean;
}
const InventoryClass = ["regular", "returned", "refurbished"];
const InventoryManufacturer = ["Samsung", "LG", "Panasonic", "Korea-Tech"];
const InventorySalePrice = [
  1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
];
const InventoryCostPrice = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
const InventoryTotalUnits = [500, 1000, 1500, 2000, 2500, 3000];
export const generateRandomInventoryEntries = (
  count: number,
  filterTags?: {
    classTags?: string[];
    includeDeleted?: boolean;
    outOfStock?: boolean;
  }
): InventoryEntries[] => {
  const entries: InventoryEntries[] = [];

  while (entries.length < count) {
    const salePrice: number = getRandomItem(InventorySalePrice);
    const isOutOfStock = Math.random() < 0.2; // 20% chance of being out of stock
    const totalUnits: number = getRandomItem(InventoryTotalUnits);
    const currentUnits: number = isOutOfStock
      ? 0
      : getRandomNumber(1, totalUnits);

    const entry: InventoryEntries = {
      no: entries.length + 1,
      name: { image: getRandomItem(images), text: getRandomItem(solarPanels) },
      class: getRandomItem(InventoryClass),
      salePrice: salePrice,
      inventoryValue: totalUnits * salePrice,
      stockLevel: { totalUnits: totalUnits, currentUnits: currentUnits },
      deleted: Math.random() < 0.1, // 10% chance of being marked as deleted
    };

    // Apply filtering based on class, deleted status, and stock status
    const matchesClass =
      !filterTags?.classTags || filterTags.classTags.includes(entry.class);
    const matchesDeleted =
      filterTags?.includeDeleted === undefined ||
      filterTags.includeDeleted === entry.deleted;
    const matchesOutOfStock =
      filterTags?.outOfStock === undefined ||
      filterTags.outOfStock === (entry.stockLevel.currentUnits === 0);

    if (matchesClass && matchesDeleted && matchesOutOfStock) {
      entries.push(entry);
    }
  }

  return entries;
};

type InventoryModalEntries = {
  inventoryId: string | number;
  inventoryImage: string;
  inventoryName: string;
  inventoryClass: string;
  inventoryCategory: string;
  sku: string;
  manufacturerName: string;
  dateOfManufacture: string;
  numberOfStock: number;
  costPrice: number;
  salePrice: number;
};

export const generateRandomInventoryEntry = (): InventoryModalEntries => {
  const inventoryEntry: InventoryModalEntries = {
    inventoryId: 100000 + Math.floor(Math.random() * 1000),
    inventoryImage: getRandomItem(images),
    inventoryName: getRandomItem(solarPanels),
    inventoryClass: getRandomItem(InventoryClass),
    inventoryCategory: getRandomItem(productCategory),
    sku: `${100000 + Math.floor(Math.random() * 1000)}`,
    manufacturerName: getRandomItem(InventoryManufacturer),
    dateOfManufacture: new Date().toISOString(),
    numberOfStock: getRandomItem(InventoryTotalUnits),
    costPrice: getRandomItem(InventoryCostPrice),
    salePrice: getRandomItem(InventorySalePrice),
  };

  return inventoryEntry;
};

interface InventoryHistoryEntries {
  datetime: string;
  stockNumber: number;
  stockValue: number;
  staffName: string;
}

export const generateRandomInventoryHistoryEntries = (
  count: number
): InventoryHistoryEntries[] => {
  const totalUnits: number = getRandomItem(InventoryTotalUnits);
  const salePrice: number = getRandomItem(InventorySalePrice);
  const entries: InventoryHistoryEntries[] = [];

  for (let i = 1; i <= count; i++) {
    entries.push({
      datetime: new Date().toISOString(),
      stockNumber: totalUnits,
      stockValue: totalUnits * salePrice,
      staffName: getRandomItem(names),
    });
  }

  return entries;
};

export const generateRandomTransactionEntries = (count: number) => {
  const entries = Array.from({ length: count }, (_, index) => ({
    no: index + 1,
    transactionId: `TXN${Math.floor(Math.random() * 90000) + 10000}`,
    customer: `Customer${Math.floor(Math.random() * 50) + 1}`,
    datetime: new Date().toISOString(),
    productType: ["Recharge", "Installment"][Math.floor(Math.random() * 2)],
    amount: (Math.random() * (1000 - 10) + 10).toFixed(2),
    status: ["Successful", "Reversed"][Math.floor(Math.random() * 2)],
  }));
  return entries;
};

export const generateRandomContracts = (count: number) => {
  const entries = Array.from({ length: count }, () => ({
    productCategory: getRandomItem(["SHS", "EAAS", "Rooftop"]),
    paymentMode: getRandomItem(["Single Deposit", "Recharge", "Instalmental"]),
    customer: getRandomItem(["John Bull", "Jane Doe"]),
    contractSigned: getRandomItem([true, false]),
  }));
  return entries;
};

export const generateRandomSalesEntries = (count: number) => {
  const entries = Array.from({ length: count }, (_, index) => ({
    no: index + 1,
    salesId: `5bsdb3b2b2${Math.floor(Math.random() * 90000) + 10000}`,
    dateCreated: new Date().toISOString(),
    customer: getRandomItem(["John Bull", "Jane Doe"]),
    status: getRandomItem([
      "NEW",
      "IN CONTRACT",
      "IN PAYMENT",
      "IN INVENTORY",
      "IN INSTALLATION",
      "CLOSED",
    ]),
    productCategory: getRandomItem(["SHS", "EAAS", "Rooftop"]),
    paymentMode: getRandomItem(["Single Deposit", "Recharge", "Instalmental"]),
    amount: (Math.random() * (10000000 - 10) + 10).toFixed(2),
  }));
  return entries;
};

export const sampleDeviceData = {
  devices: [
    {
      id: "678a57732e9e2171dbe23e63",
      serialNumber: "SR26/SR/2501100002",
      key: "9bb26bc36d7c1ac09eeba30ed9fa47a8",
      startingCode: "705806064",
      count: "1",
      timeDivider: "1",
      restrictedDigitMode: false,
      hardwareModel: "SR26",
      firmwareVersion: "V1",
      isTokenable: false,
      saleItemId: "678c4c16684bca499140e85b",
      createdAt: "2025-01-17T13:24:13.775Z",
      updatedAt: "2025-01-17T13:24:13.775Z",
    },
    {
      id: "678a57732e9e2171dbe23e64",
      serialNumber: "SR26/SR/2501100003",
      key: "eb436ec88b69c91b192674830d830605",
      startingCode: "596689510",
      count: "1",
      timeDivider: "1",
      restrictedDigitMode: false,
      hardwareModel: "SR26",
      firmwareVersion: "V1",
      isTokenable: false,
      saleItemId: null,
      createdAt: "2025-01-17T13:24:13.775Z",
      updatedAt: "2025-01-17T13:24:13.775Z",
    },
    {
      id: "678a57742e9e2171dbe23e65",
      serialNumber: "SR26/SR/2501100004",
      key: "2bc649df191d6683a33ece436b482552",
      startingCode: "148356658",
      count: "1",
      timeDivider: "1",
      restrictedDigitMode: false,
      hardwareModel: "SR26",
      firmwareVersion: "V1",
      isTokenable: false,
      saleItemId: null,
      createdAt: "2025-01-17T13:24:13.775Z",
      updatedAt: "2025-01-17T13:24:13.775Z",
    },
    {
      id: "678a57742e9e2171dbe23e66",
      serialNumber: "SR26/SR/2501100005",
      key: "409d53a51611c534f555a4fed77f085b",
      startingCode: "957109357",
      count: "1",
      timeDivider: "1",
      restrictedDigitMode: false,
      hardwareModel: "SR26",
      firmwareVersion: "V1",
      isTokenable: false,
      saleItemId: null,
      createdAt: "2025-01-17T13:24:13.775Z",
      updatedAt: "2025-01-17T13:24:13.775Z",
    },
    {
      id: "678a57742e9e2171dbe23e67",
      serialNumber: "SR26/SR/2501100006",
      key: "6070e50cfa76c9c708206add21edc224",
      startingCode: "66293828",
      count: "1",
      timeDivider: "1",
      restrictedDigitMode: false,
      hardwareModel: "SR26",
      firmwareVersion: "V1",
      isTokenable: false,
      saleItemId: null,
      createdAt: "2025-01-17T13:24:13.775Z",
      updatedAt: "2025-01-17T13:24:13.775Z",
    },
    {
      id: "678a57742e9e2171dbe23e68",
      serialNumber: "SR26/SR/250110007",
      key: "2d3cf8232a6a77637ac26f8af40cb382",
      startingCode: "546400202",
      count: "1",
      timeDivider: "1",
      restrictedDigitMode: false,
      hardwareModel: "SR26",
      firmwareVersion: "V1",
      isTokenable: false,
      saleItemId: null,
      createdAt: "2025-01-17T13:24:13.775Z",
      updatedAt: "2025-01-17T13:24:13.775Z",
    },
    {
      id: "678a57742e9e2171dbe23e69",
      serialNumber: "SR26/SR/250110008",
      key: "1aa61de09454686512ccf19c1be475a6",
      startingCode: "231638505",
      count: "1",
      timeDivider: "1",
      restrictedDigitMode: false,
      hardwareModel: "SR26",
      firmwareVersion: "V1",
      isTokenable: false,
      saleItemId: null,
      createdAt: "2025-01-17T13:24:13.775Z",
      updatedAt: "2025-01-17T13:24:13.775Z",
    },
    {
      id: "678a57742e9e2171dbe23e6a",
      serialNumber: "SR26/SR/250110009",
      key: "9bf8b80c58fd2d2063982e82725cefd6",
      startingCode: "629094429",
      count: "1",
      timeDivider: "1",
      restrictedDigitMode: false,
      hardwareModel: "SR26",
      firmwareVersion: "V1",
      isTokenable: false,
      saleItemId: null,
      createdAt: "2025-01-17T13:24:13.775Z",
      updatedAt: "2025-01-17T13:24:13.775Z",
    },
    {
      id: "678a57742e9e2171dbe23e6b",
      serialNumber: "SR26/SR/250110010",
      key: "04792400122411ba29aa288bc9b7e680",
      startingCode: "444392724",
      count: "1",
      timeDivider: "1",
      restrictedDigitMode: false,
      hardwareModel: "SR26",
      firmwareVersion: "V1",
      isTokenable: false,
      saleItemId: null,
      createdAt: "2025-01-17T13:24:13.775Z",
      updatedAt: "2025-01-17T13:24:13.775Z",
    },
    {
      id: "678a59fd12394b4002be7537",
      serialNumber: "SR26/SR/2501100001",
      key: "e42fe95bcdc443718701e0e67ff1ddad",
      startingCode: "674975504",
      count: "1",
      timeDivider: "1",
      restrictedDigitMode: false,
      hardwareModel: "SR26",
      firmwareVersion: "V1",
      isTokenable: false,
      saleItemId: null,
      createdAt: "2025-01-17T13:24:13.775Z",
      updatedAt: "2025-01-17T13:24:13.775Z",
    },
  ],
};
