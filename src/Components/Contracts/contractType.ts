export type Contract = {
  id: string;
  initialAmountPaid: number;
  nextOfKinFullName: string;
  nextOfKinRelationship: string;
  nextOfKinPhoneNumber: string;
  nextOfKinHomeAddress: string;
  nextOfKinEmail: string;
  nextOfKinDateOfBirth: string; // ISO date string
  nextOfKinNationality: string;
  guarantorFullName: string;
  guarantorPhoneNumber: string;
  guarantorHomeAddress: string;
  guarantorEmail: string;
  guarantorIdType: string;
  guarantorIdNumber: string;
  guarantorIdIssuingCountry: string;
  guarantorIdIssueDate: string; // ISO date string
  guarantorIdExpirationDate: string; // ISO date string
  guarantorNationality: string;
  guarantorDateOfBirth: string; // ISO date string
  idType: string;
  idNumber: string;
  issuingCountry: string;
  issueDate: string; // ISO date string
  expirationDate: string; // ISO date string
  fullNameAsOnID: string;
  addressAsOnID: string;
  signedContractUrl: string | null;
  signedAt: string | null; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  sale: Sale[];
};

type Sale = {
  id: string;
  category: string;
  status: string;
  customerId: string;
  creatorId: string;
  totalPrice: number;
  totalPaid: number;
  installmentAccountDetailsId: string;
  deliveredAccountDetails: boolean;
  contractId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt: string | null; // ISO date string
  customer: Customer;
  saleItems: SaleItem[];
};

type Customer = {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  addressType: string;
  location: string;
  longitude: number | null;
  latitude: number | null;
  status: string;
  type: string;
  creatorId: string;
  agentId: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt: string | null; // ISO date string
};

export type SaleItem = {
  id: string;
  productId: string;
  quantity: number;
  saleId: string;
  discount: number;
  totalPrice: number;
  paymentMode: string;
  miscellaneousPrices: {
    ew: number;
  };
  saleRecipientId: string;
  installmentDuration: number;
  installmentStartingPrice: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  product: Product;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  image: string;
  currency: string;
  paymentModes: string;
  creatorId: string;
  categoryId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  inventories: Inventory[];
};

type Inventory = {
  id: string;
  productId: string;
  quantity: number;
  inventoryId: string;
  inventory: InventoryDetail;
};

type InventoryDetail = {
  id: string;
  name: string;
  manufacturerName: string;
  sku: string;
  image: string;
  dateOfManufacture: string | null; // ISO date string
  status: string;
  class: string;
  inventoryCategoryId: string;
  inventorySubCategoryId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt: string | null; // ISO date string
};
