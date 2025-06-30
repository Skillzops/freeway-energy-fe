import { toJS } from "mobx";
import {
  types,
  Instance,
  cast,
  applySnapshot,
  SnapshotIn,
} from "mobx-state-tree";

const defaultValues: SnapshotIn<typeof saleStore> = {
  category: "PRODUCT",
  customer: null,
  doesCustomerExist: false,
  products: [],
  doesProductCategoryExist: false,
  parameters: [],
  miscellaneousPrices: [],
  devices: [],
  saleItems: [],
  identificationDetails: {
    idType: "",
    idNumber: "",
    issuingCountry: "",
    issueDate: "",
    expirationDate: "",
    fullNameAsOnID: "",
    addressAsOnID: "",
  },
  nextOfKinDetails: {
    fullName: "",
    relationship: "",
    phoneNumber: "",
    email: "",
    homeAddress: "",
    dateOfBirth: "",
    nationality: "",
  },
  guarantorDetails: {
    fullName: "",
    phoneNumber: "",
    email: "",
    homeAddress: "",
    dateOfBirth: "",
    nationality: "",
    identificationDetails: {
      idType: "",
      idNumber: "",
      issuingCountry: "",
      issueDate: "",
      expirationDate: "",
      fullNameAsOnID: "",
      addressAsOnID: "",
    },
  },
  paymentDetails: {
    publicKey: "",
    email: "",
    amount: 0,
    currency: "NGN",
    reference: "",
    metadata: {},
    callback: null,
    onClose: null,
    channels: ["card", "bank", "ussd", "qr", "mobile_money"],
  },
  paymentMethod: "ONLINE",
};

const IdentificationDetailsModel = types.model({
  idType: types.string,
  idNumber: types.string,
  issuingCountry: types.string,
  issueDate: types.string,
  expirationDate: types.string,
  fullNameAsOnID: types.string,
  addressAsOnID: types.string,
});

const GuarantorIdentityModel = types.model({
  idType: types.string,
  idNumber: types.string,
  issuingCountry: types.string,
  issueDate: types.string,
  expirationDate: types.string,
  fullNameAsOnID: types.string,
  addressAsOnID: types.string,
});

const GuarantorDetailsModel = types.model({
  fullName: types.string,
  phoneNumber: types.string,
  email: types.string,
  homeAddress: types.string,
  dateOfBirth: types.string,
  nationality: types.string,
  identificationDetails: GuarantorIdentityModel,
});

const NextOfKinDetailsModel = types.model({
  fullName: types.string,
  relationship: types.string,
  phoneNumber: types.string,
  email: types.string,
  homeAddress: types.string,
  dateOfBirth: types.string,
  nationality: types.string,
});

const CustomerModel = types.model({
  customerId: types.string,
  customerName: types.string,
  firstname: types.string,
  lastname: types.string,
  location: types.string,
  email: types.string,
  phone: types.string,
});

const ProductModel = types.model({
  productId: types.string,
  productName: types.string,
  productUnits: types.number,
  productPrice: types.string,
  productImage: types.string,
  productTag: types.string,
  productPaymentModes: types.string,
});

const ParamModel = types.model({
  paymentMode: types.enumeration(["INSTALLMENT", "ONE_OFF"]),
  installmentDuration: types.number,
  installmentStartingPrice: types.number,
  discount: types.number,
});

const ParametersModel = types.model({
  currentProductId: types.string,
  params: ParamModel,
});

const MiscellaneousPricesModel = types.model({
  currentProductId: types.string,
  costs: types.map(types.number),
});

const SaleMiscellaneousPricesModel = types.model({
  costs: types.map(types.number),
});

const DevicesModel = types.model({
  currentProductId: types.string,
  devices: types.array(types.string),
});

const TentativeDeviceInventory = types.model({
  inventoryId: types.string,
  devices: types.array(types.string),
});

const TentativeDevicesModel = types.model({
  currentProductId: types.string,
  devices: types.array(types.string),
  inventories: types.array(TentativeDeviceInventory),
});

const SaleRecipientModel = types.model({
  firstname: types.string,
  lastname: types.string,
  address: types.string,
  phone: types.string,
  email: types.string,
});

const RecipientModel = types.model({
  currentProductId: types.string,
  recipient: SaleRecipientModel,
});

const SaleItemsModel = types.model({
  productId: types.string,
  quantity: types.number,
  paymentMode: types.enumeration(["INSTALLMENT", "ONE_OFF"]),
  discount: types.number,
  installmentDuration: types.maybe(types.number),
  installmentStartingPrice: types.maybe(types.number),
  devices: types.array(types.string),
  miscellaneousPrices: types.maybe(SaleMiscellaneousPricesModel),
  saleRecipient: types.maybe(SaleRecipientModel),
});

const CustomizationsModel = types.model({
  title: types.string,
  description: types.string,
  logo: types.string,
});

const PaymentDataModel = types.model({
  publicKey: types.string,
  email: types.string,
  amount: types.number,
  currency: types.string,
  reference: types.string,
  metadata: types.maybe(types.frozen()), // Accepts any JSON object
  callback: types.maybe(types.frozen()),
  onClose: types.maybe(types.frozen()),
  channels: types.array(types.string),
});

const saleStore = types
  .model({
    category: types.enumeration(["PRODUCT"]),
    customer: types.maybeNull(CustomerModel),
    doesCustomerExist: types.boolean,
    products: types.array(ProductModel),
    doesProductCategoryExist: types.boolean,
    parameters: types.array(ParametersModel),
    miscellaneousPrices: types.array(MiscellaneousPricesModel),
    devices: types.array(DevicesModel),
    tentativeDevices: types.array(TentativeDevicesModel),
    saleRecipient: types.array(RecipientModel),
    saleItems: types.array(SaleItemsModel),
    identificationDetails: IdentificationDetailsModel,
    nextOfKinDetails: NextOfKinDetailsModel,
    guarantorDetails: GuarantorDetailsModel,
    paymentDetails: PaymentDataModel,
    paymentMethod: types.enumeration(["ONLINE", "CASH"]),
  })
  .actions((self) => ({
    addSaleItem(productId: string) {
      const product = self.products.find((p) => p.productId === productId);
      if (!product?.productId) return;

      const params = self.parameters.find(
        (p) => p.currentProductId === productId
      );

      // Ensure devices is a plain array of strings
      const devices = toJS(
        self.devices.find((d) => d.currentProductId === productId)?.devices ||
          []
      );

      // Convert `miscellaneousPrices` into a plain object, filtering based on the current productId
      const miscellaneousCosts = self.miscellaneousPrices.reduce(
        (acc, misc) => {
          // Only include the costs that match the current productId
          if (misc.currentProductId === productId) {
            const plainCosts = toJS(misc.costs); // Convert to a plain object

            plainCosts.forEach((cost, name) => {
              if (typeof cost === "number") {
                acc[name] = cost; // Use the name as the key and cost as the value
              } else {
                console.warn(`Invalid cost value for ${name}:`, cost);
              }
            });
          }

          return acc;
        },
        {} as Record<string, number>
      );

      // Fetch or create the saleRecipient for the given productId
      const recipient = self.saleRecipient.find(
        (recipient) => recipient.currentProductId === productId
      );

      // Ensure recipient is copied to avoid using a reference directly
      const saleRecipient = recipient
        ? { ...recipient.recipient } // Create a shallow copy of the recipient
        : {
            firstname: "",
            lastname: "",
            address: "",
            phone: "",
            email: "",
          };

      // Check if saleItem with the same productId exists
      const existingSaleItem = self.saleItems.find(
        (item) => item.productId === productId
      );

      if (existingSaleItem) {
        // Update existing sale item instead of adding a new one
        existingSaleItem.quantity = product?.productUnits || 0;
        existingSaleItem.paymentMode = params?.params?.paymentMode || "ONE_OFF";
        existingSaleItem.discount = params?.params?.discount || 0;
        existingSaleItem.installmentDuration =
          params?.params?.installmentDuration || 0;
        existingSaleItem.installmentStartingPrice =
          params?.params?.installmentStartingPrice || 0;
        existingSaleItem.devices = cast(devices);
        existingSaleItem.miscellaneousPrices = {
          costs: cast(miscellaneousCosts),
        };
        existingSaleItem.saleRecipient = { ...saleRecipient };
      } else {
        // Add a new sale item if it doesn't exist
        self.saleItems.push({
          productId,
          quantity: product?.productUnits || 0,
          paymentMode: params?.params?.paymentMode || "ONE_OFF",
          discount: params?.params?.discount || 0,
          installmentDuration: params?.params?.installmentDuration || 0,
          installmentStartingPrice:
            params?.params?.installmentStartingPrice || 0,
          devices: cast(devices),
          miscellaneousPrices: { costs: cast(miscellaneousCosts) },
          saleRecipient: { ...saleRecipient },
        });
      }
    },
    getTransformedSaleItems() {
      return self.saleItems.map((item) => {
        const plainItem = toJS(item);
        const relevantMiscPrices = self.miscellaneousPrices.find(
          (m) => m.currentProductId === plainItem.productId
        ) || { costs: new Map() };

        const miscellaneousCosts = Array.from(
          relevantMiscPrices.costs.entries()
        ).reduce((acc, [name, cost]) => {
          if (typeof cost === "number") {
            acc[name] = cost;
          } else {
            console.warn(`Invalid cost value for ${name}:`, cost);
          }
          return acc;
        }, {} as Record<string, number>);

        if (Object.keys(miscellaneousCosts).length === 0) {
          delete plainItem.miscellaneousPrices;
        }

        const transformedItem = {
          ...plainItem,
          ...(Object.keys(miscellaneousCosts).length > 0 && {
            miscellaneousPrices: miscellaneousCosts,
          }),
        };

        return transformedItem;
      });
    },
    doesSaleItemHaveInstallment() {
      const filteredArray = self.saleItems.filter(
        (item) => item.paymentMode === "INSTALLMENT"
      );
      const installmentExists = filteredArray.length > 0;
      return installmentExists;
    },
    removeSaleItem(productId: string) {
      self.saleItems.replace(
        self.saleItems.filter((item) => item.productId !== productId)
      );
    },
    clearSaleItems() {
      self.saleItems.clear();
    },
    addCustomer(customer: typeof self.customer) {
      self.customer = customer;
    },
    removeCustomer() {
      self.customer = null;
    },
    addUpdateCategory(category: "PRODUCT") {
      self.category = category;
    },
    setCustomerExist(value: boolean) {
      self.doesCustomerExist = value;
    },
    addProduct(product: any) {
      const existingIndex = self.products.findIndex(
        (p) => p.productId === product.productId
      );

      if (existingIndex !== -1) {
        // Update existing product
        self.products[existingIndex] = {
          ...self.products[existingIndex],
          ...product,
        };
      } else {
        // Add new product
        self.products.push(product);
      }
    },
    removeProduct(productId: string) {
      this.removeParameter(productId);
      this.removeMiscellaneousPrice(productId);
      this.removeDevices(productId);
      this.removeTentativeDevices(productId);
      this.removeRecipient(productId);

      const index = self.products.findIndex((p) => p.productId === productId);
      if (index !== -1) self.products.splice(index, 1);
      this.removeSaleItem(productId);
    },
    getProductById(productId?: string) {
      const product = self.products.find((p) => p.productId === productId);
      return product;
    },
    currentProductUnits(productId?: string) {
      const currentUnits = self.products.find(
        (p) => p.productId === productId
      )?.productUnits;
      return currentUnits;
    },
    emptyProducts() {
      self.products.clear();
    },
    setProductCategoryExist(value: boolean) {
      self.doesProductCategoryExist = value;
    },
    addParameters(
      currentProductId: string,
      params: {
        paymentMode: "INSTALLMENT" | "ONE_OFF";
        installmentDuration: number;
        installmentStartingPrice: number;
        discount: number;
      }
    ) {
      const existingIndex = self.parameters.findIndex(
        (d) => d.currentProductId === currentProductId
      );

      if (existingIndex !== -1) {
        applySnapshot(self.parameters[existingIndex].params, params);
      } else {
        self.parameters.push(
          ParametersModel.create({
            currentProductId,
            params: toJS(params),
          })
        );
      }
    },
    getParametersByProductId(productId: string) {
      const parameters = self.parameters.find(
        (p) => p.currentProductId === productId
      )?.params;
      return parameters;
    },
    removeParameter(currentProductId?: string) {
      self.parameters.replace(
        self.parameters.filter((p) => p.currentProductId !== currentProductId)
      );
      self.saleItems.forEach((item) => {
        if (item.productId === currentProductId) {
          item.paymentMode = "ONE_OFF";
          item.installmentDuration = 0;
          item.installmentStartingPrice = 0;
          item.discount = 0;
        }
      });
    },
    addOrUpdateMiscellaneousPrice(
      currentProductId: string,
      costs: Record<string, number>
    ) {
      const existingIndex = self.miscellaneousPrices.findIndex(
        (p) => p.currentProductId === currentProductId
      );

      if (existingIndex !== -1) {
        // Update existing entry
        Object.entries(costs).forEach(([key, value]) => {
          self.miscellaneousPrices[existingIndex].costs.set(key, value);
        });
      } else {
        // Add new entry
        self.miscellaneousPrices.push(
          MiscellaneousPricesModel.create({ currentProductId, costs })
        );
      }
    },
    getMiscellaneousByProductId(productId: string) {
      return (
        self.miscellaneousPrices.find(
          (m) => m.currentProductId === productId
        ) || { costs: new Map() }
      );
    },
    removeMiscellaneousPrice(currentProductId?: string) {
      self.miscellaneousPrices.replace(
        self.miscellaneousPrices.filter(
          (p) => p.currentProductId !== currentProductId
        )
      );
      self.saleItems.forEach((item) => {
        if (item.productId === currentProductId) {
          item.miscellaneousPrices = undefined;
        }
      });
    },
    addOrUpdateDevices(currentProductId: string, deviceList: string[]) {
      const existingIndex = self.devices.findIndex(
        (d) => d.currentProductId === currentProductId
      );

      // Normalize all device IDs to strings
      const normalizedDevices = deviceList.map((d) => String(d));

      if (existingIndex !== -1) {
        // Get current devices and merge with new ones
        const currentDevices = [...self.devices[existingIndex].devices];
        const mergedDevices = [
          ...new Set([...currentDevices, ...normalizedDevices]),
        ];

        // Use put to update the array in a MobX-friendly way
        self.devices[existingIndex].devices.clear();
        mergedDevices.forEach((deviceId) => {
          self.devices[existingIndex].devices.push(deviceId);
        });
      } else {
        // Create new entry with normalized devices
        self.devices.push(
          DevicesModel.create({
            currentProductId,
            devices: normalizedDevices,
          })
        );
      }
    },
    getSelectedDevices(productId: string) {
      const devices = self.devices.find(
        (d) => d.currentProductId === productId
      )?.devices;
      return devices;
    },
    removeDevices(currentProductId?: string) {
      self.devices.replace(
        self.devices.filter((d) => d.currentProductId !== currentProductId)
      );
      // Empty the `devices` array for the matching `productId` in `saleItems`
      self.saleItems.forEach((item) => {
        if (item.productId === currentProductId) {
          item.devices.replace([]); // Use `replace` to clear the array
        }
      });
    },
    addOrUpdateTentativeDevices(
      currentProductId: string,
      deviceList: string[],
      inventoryId?: string // Optional inventory ID
    ) {
      const existingIndex = self.tentativeDevices.findIndex(
        (d) => d.currentProductId === currentProductId
      );

      const normalizedDevices = deviceList.map((d) => String(d));

      if (existingIndex !== -1) {
        // Update main devices list
        const currentDevices = [
          ...self.tentativeDevices[existingIndex].devices,
        ];
        const mergedDevices = [
          ...new Set([...currentDevices, ...normalizedDevices]),
        ];

        self.tentativeDevices[existingIndex].devices.clear();
        mergedDevices.forEach((deviceId) => {
          self.tentativeDevices[existingIndex].devices.push(deviceId);
        });

        // Update inventory-specific devices if provided
        if (inventoryId) {
          const inventoryIndex = self.tentativeDevices[
            existingIndex
          ].inventories.findIndex((inv) => inv.inventoryId === inventoryId);

          if (inventoryIndex !== -1) {
            const currentInventoryDevices = [
              ...self.tentativeDevices[existingIndex].inventories[
                inventoryIndex
              ].devices,
            ];
            const mergedInventoryDevices = [
              ...new Set([...currentInventoryDevices, ...normalizedDevices]),
            ];

            self.tentativeDevices[existingIndex].inventories[
              inventoryIndex
            ].devices.clear();
            mergedInventoryDevices.forEach((deviceId) => {
              self.tentativeDevices[existingIndex].inventories[
                inventoryIndex
              ].devices.push(deviceId);
            });
          } else {
            self.tentativeDevices[existingIndex].inventories.push(
              TentativeDeviceInventory.create({
                inventoryId,
                devices: normalizedDevices,
              })
            );
          }
        }
      } else {
        // Create new entry
        const newEntry: any = {
          currentProductId,
          devices: normalizedDevices,
          inventories: [],
        };

        if (inventoryId) {
          newEntry.inventories.push({
            inventoryId,
            devices: normalizedDevices,
          });
        }

        self.tentativeDevices.push(TentativeDevicesModel.create(newEntry));
      }
    },
    getAllTentativeDevices(productId: string) {
      const productEntry = self.tentativeDevices.find(
        (d) => d.currentProductId === productId
      );

      return productEntry ? productEntry.devices : [];
    },
    getSelectedTentativeDevices(productId: string, inventoryId?: string) {
      const productEntry = self.tentativeDevices.find(
        (d) => d.currentProductId === productId
      );

      if (!productEntry) return [];

      // Return inventory-specific devices if requested
      if (inventoryId) {
        const inventory = productEntry.inventories.find(
          (inv) => inv.inventoryId === inventoryId
        );
        return inventory ? [...inventory.devices] : [];
      }


      // Default to all devices for product
      return [...productEntry.devices];
    },
    removeSingleTentativeDevice(
      currentProductId: string,
      deviceIdToRemove: string,
      inventoryId?: string
    ) {
      const productIndex = self.tentativeDevices.findIndex(
        (d) => d.currentProductId === currentProductId
      );

      if (productIndex !== -1) {
        // Remove from main devices list
        const updatedDevices = self.tentativeDevices[
          productIndex
        ].devices.filter((deviceId) => deviceId !== deviceIdToRemove);
        self.tentativeDevices[productIndex].devices.replace(updatedDevices);

        // Remove from specific inventory if provided
        if (inventoryId) {
          const inventoryIndex = self.tentativeDevices[
            productIndex
          ].inventories.findIndex((inv) => inv.inventoryId === inventoryId);

          if (inventoryIndex !== -1) {
            const updatedInventoryDevices = self.tentativeDevices[
              productIndex
            ].inventories[inventoryIndex].devices.filter(
              (deviceId) => deviceId !== deviceIdToRemove
            );

            self.tentativeDevices[productIndex].inventories[
              inventoryIndex
            ].devices.replace(updatedInventoryDevices);

            // Remove inventory entry if empty
            if (updatedInventoryDevices.length === 0) {
              self.tentativeDevices[productIndex].inventories.splice(
                inventoryIndex,
                1
              );
            }
          }
        }

        // Remove entire product entry if no devices left
        if (
          updatedDevices.length === 0 &&
          self.tentativeDevices[productIndex].inventories.length === 0
        ) {
          self.tentativeDevices.splice(productIndex, 1);
        }
      }
    },
    removeTentativeDevices(currentProductId?: string, inventoryId?: string) {
      if (!currentProductId) return;

      if (inventoryId) {
        // Remove specific inventory devices only
        const productIndex = self.tentativeDevices.findIndex(
          (d) => d.currentProductId === currentProductId
        );

        if (productIndex !== -1) {
          const inventoryIndex = self.tentativeDevices[
            productIndex
          ].inventories.findIndex((inv) => inv.inventoryId === inventoryId);

          if (inventoryIndex !== -1) {
            // Remove devices from main list that only belong to this inventory
            const inventoryDevices = new Set(
              self.tentativeDevices[productIndex].inventories[
                inventoryIndex
              ].devices
            );

            const updatedDevices = self.tentativeDevices[
              productIndex
            ].devices.filter((deviceId) => {
              // Check if device exists in other inventories
              const inOtherInventories = self.tentativeDevices[
                productIndex
              ].inventories.some(
                (inv, idx) =>
                  idx !== inventoryIndex && inv.devices.includes(deviceId)
              );
              return !inventoryDevices.has(deviceId) || inOtherInventories;
            });

            self.tentativeDevices[productIndex].devices.replace(updatedDevices);
            self.tentativeDevices[productIndex].inventories.splice(
              inventoryIndex,
              1
            );

            // Remove product entry if empty
            if (
              updatedDevices.length === 0 &&
              self.tentativeDevices[productIndex].inventories.length === 0
            ) {
              self.tentativeDevices.splice(productIndex, 1);
            }
          }
        }
      } else {
        // Remove all devices for product
        self.tentativeDevices.replace(
          self.tentativeDevices.filter(
            (d) => d.currentProductId !== currentProductId
          )
        );
      }
    },
    getTentativeDevicesByInventory(productId: string, inventoryId: string) {
      const productEntry = self.tentativeDevices.find(
        (d) => d.currentProductId === productId
      );

      if (!productEntry) return [];

      const inventory = productEntry.inventories.find(
        (inv) => inv.inventoryId === inventoryId
      );

      return inventory ? [...inventory.devices] : [];
    },
    addIdentificationDetails(details: typeof self.identificationDetails) {
      self.identificationDetails = details;
    },
    removeIdentificationDetails() {
      self.identificationDetails = {
        idType: "",
        idNumber: "",
        issuingCountry: "",
        issueDate: "",
        expirationDate: "",
        fullNameAsOnID: "",
        addressAsOnID: "",
      };
    },
    addNextOfKinDetails(details: typeof self.nextOfKinDetails) {
      self.nextOfKinDetails = details;
    },
    removeNextOfKinDetails() {
      self.nextOfKinDetails = {
        fullName: "",
        relationship: "",
        phoneNumber: "",
        email: "",
        homeAddress: "",
        dateOfBirth: "",
        nationality: "",
      };
    },
    addGuarantorDetails(details: typeof self.guarantorDetails) {
      self.guarantorDetails = details;
    },
    removeGuarantorDetails() {
      self.guarantorDetails = {
        fullName: "",
        phoneNumber: "",
        email: "",
        homeAddress: "",
        dateOfBirth: "",
        nationality: "",
        identificationDetails: {
          idType: "",
          idNumber: "",
          issuingCountry: "",
          issueDate: "",
          expirationDate: "",
          fullNameAsOnID: "",
          addressAsOnID: "",
        },
      };
    },
    addOrUpdateRecipient(
      currentProductId: string,
      recipient: {
        firstname: string;
        lastname: string;
        address: string;
        phone: string;
        email: string;
      }
    ) {
      const existingIndex = self.saleRecipient.findIndex(
        (d) => d.currentProductId === currentProductId
      );

      if (existingIndex !== -1) {
        // Update the existing recipient using applySnapshot
        applySnapshot(self.saleRecipient[existingIndex].recipient, recipient);
      } else {
        // Add new recipient if not found
        self.saleRecipient.push(
          RecipientModel.create({
            currentProductId,
            recipient: toJS(recipient),
          })
        );
      }
    },
    getRecipientByProductId(productId: string) {
      const recipient = self.saleRecipient.find(
        (r) => r.currentProductId === productId
      )?.recipient;
      return recipient;
    },
    removeRecipient(currentProductId: string) {
      self.saleRecipient.replace(
        self.saleRecipient.filter(
          (d) => d.currentProductId !== currentProductId
        )
      );
      self.saleItems.forEach((item) => {
        if (item.productId === currentProductId) {
          item.saleRecipient = undefined;
        }
      });
    },
    addPaymentDetails(data: any) {
      self.paymentDetails = data;
    },
    setPaymentMethod(method: "ONLINE" | "CASH") {
      self.paymentMethod = method;
    },
    purgeStore() {
      applySnapshot(self, defaultValues);
    },
    getPayload() {
      const formatDate = (dateString: string) => {
        if (!dateString) return "";
        // If it's an ISO string, extract just the date part
        if (dateString.includes('T')) {
          return dateString.split('T')[0];
        }
        return dateString;
      };

      const payload: any = {
        category: self.category,
        customerId: self.customer?.customerId,
        saleItems: this.getTransformedSaleItems(),
        paymentMethod: self.paymentMethod,
        applyMargin: true, // Default to true as per schema
      };

      // If any sale item has installment payment mode, include additional required fields
      if (this.doesSaleItemHaveInstallment()) {
        // BVN will be provided by the CreateNewSale component
        // We don't set it here as it's not stored in the store
        
        // Format identification details with proper date formatting
        const identificationDetails = toJS(self.identificationDetails);
        payload.identificationDetails = {
          ...identificationDetails,
          issueDate: formatDate(identificationDetails.issueDate),
          expirationDate: formatDate(identificationDetails.expirationDate),
        };
        
        // Format next of kin details with proper date formatting
        const nextOfKinDetails = toJS(self.nextOfKinDetails);
        payload.nextOfKinDetails = {
          ...nextOfKinDetails,
          dateOfBirth: formatDate(nextOfKinDetails.dateOfBirth),
        };
        
        // Format guarantor details with proper date formatting
        const guarantorDetails = toJS(self.guarantorDetails);
        payload.guarantorDetails = {
          ...guarantorDetails,
          dateOfBirth: formatDate(guarantorDetails.dateOfBirth),
          identificationDetails: {
            ...guarantorDetails.identificationDetails,
            issueDate: formatDate(guarantorDetails.identificationDetails.issueDate),
            expirationDate: formatDate(guarantorDetails.identificationDetails.expirationDate),
          },
        };
      }

      return payload;
    },
    getTotal() {
      return self.products.reduce((total, product) => {
        const baseAmount = Number(product.productPrice) * (product.productUnits || 1);
        
        // Get parameters for discount calculation
        const params = self.parameters.find(p => p.currentProductId === product.productId);
        const discount = params?.params?.discount || 0;
        const discountAmount = (baseAmount * discount) / 100;
        
        // Get miscellaneous costs
        const miscPrices = self.miscellaneousPrices.find(m => m.currentProductId === product.productId);
        const miscellaneousCosts = miscPrices ? 
          Array.from(miscPrices.costs.entries()).reduce((sum, [, cost]) => sum + cost, 0) : 0;
        
        return total + baseAmount - discountAmount + miscellaneousCosts;
      }, 0);
    },
  }));

export const SaleStore = saleStore.create({
  category: "PRODUCT",
  customer: null,
  doesCustomerExist: false,
  products: [],
  doesProductCategoryExist: false,
  parameters: [],
  miscellaneousPrices: [],
  devices: [],
  saleItems: [],
  saleRecipient: [],
  identificationDetails: {
    idType: "",
    idNumber: "",
    issuingCountry: "",
    issueDate: "",
    expirationDate: "",
    fullNameAsOnID: "",
    addressAsOnID: "",
  },
  nextOfKinDetails: {
    fullName: "",
    relationship: "",
    phoneNumber: "",
    email: "",
    homeAddress: "",
    dateOfBirth: "",
    nationality: "",
  },
  guarantorDetails: {
    fullName: "",
    phoneNumber: "",
    email: "",
    homeAddress: "",
    dateOfBirth: "",
    nationality: "",
    identificationDetails: {
      idType: "",
      idNumber: "",
      issuingCountry: "",
      issueDate: "",
      expirationDate: "",
      fullNameAsOnID: "",
      addressAsOnID: "",
    },
  },
  paymentDetails: {
    publicKey: "",
    email: "",
    amount: 0,
    currency: "NGN",
    reference: "",
    metadata: {},
    callback: null,
    onClose: null,
    channels: ["card", "bank", "ussd", "qr", "mobile_money"],
  },
  paymentMethod: "ONLINE",
});

export type SaleStoreType = Instance<typeof saleStore>;
export type SaleItemStoreType = Instance<typeof SaleStore.saleItems>;
