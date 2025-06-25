import { useEffect, useState } from "react";
import { z } from "zod";
import { FaPlus } from "react-icons/fa";
import { MdFilterList, MdFilterListOff } from "react-icons/md";
import { HiPlus } from "react-icons/hi2";
import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import { Asterik } from "../InputComponent/Input";
import { LuPlus } from "react-icons/lu";
import { TiEdit } from "react-icons/ti";
import { IoIosSearch } from "react-icons/io";
import { SaleStore } from "@/stores/SaleStore";
import { ProductDetailRow } from "./ProductSaleDisplay";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { revalidateStore, truncateTextByWord } from "@/utils/helpers";
import { observer } from "mobx-react-lite";

type DeviceFormSchema = {
  serialNumber: string;
  key: string;
  startingCode: string;
  count: number;
  timeDivider: string;
  restrictedDigitMode: boolean;
  hardwareModel: string;
  firmwareVersion: string;
  isTokenable: boolean;
};

interface DeviceResponse {
  id: string;
  serialNumber: string;
  key: string;
  startingCode: string;
  count: string;
  timeDivider: string;
  restrictedDigitMode: boolean;
  hardwareModel: string;
  firmwareVersion: string;
  isTokenable: boolean;
  saleItemId: string | null;
  createdAt: string;
  updatedAt: string;
}

const defaultFormData = {
  serialNumber: "",
  key: "",
  startingCode: "",
  count: "" as unknown as number,
  timeDivider: "",
  restrictedDigitMode: false,
  hardwareModel: "",
  firmwareVersion: "",
  isTokenable: true,
};

const filterShape = [
  { name: "General Search", value: "search" },
  { name: "Serial Number", value: "serialNumber" },
  { name: "Key", value: "key" },
  { name: "Starting Code", value: "startingCode" },
  { name: "Hardware Model", value: "hardwareModel" },
  { name: "Firmware Version", value: "firmwareVersion" },
];

const UploadDevicesForm = observer(
  ({
    handleClose,
    setDescription,
    currentProductId,
  }: {
    handleClose: () => void;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    currentProductId: string;
  }) => {
    const { apiCall } = useApiCall();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterKey, setFilterKey] = useState<any>("search");
    const [filteredDevices, setFilteredDevices] = useState<
      DeviceResponse[] | null
    >(null);
    const [toggleFilter, setToggleFilter] = useState<boolean>(false);
    const [formData, setFormData] = useState<DeviceFormSchema>(defaultFormData);
    const [loading, setLoading] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);
    const [currentInventoryId, setCurrentInventoryId] = useState<string>("");
    const [selectedDevices, setSelectedDevices] = useState<string[]>(
      SaleStore.getSelectedTentativeDevices(
        currentProductId,
        currentInventoryId
      ) || []
    );
    const [createDevice, setCreateDevice] = useState<boolean>(false);
    const [linkView, setLinkView] = useState<string>("");
    const [prevDescription, setPrevDescription] = useState<string>("");
    const [requiredQuantity, setRequiredQuantity] = useState<number>(0);
    const product = SaleStore.getProductById(currentProductId);
    const [showLinkedDevices, setShowLinkedDevices] = useState(false);

    const [linkedDevicesCount, setLinkedDevicesCount] = useState<number>(0);

    const { data, mutate } = useGetRequest("/v1/device", true);
    const {
      data: productData,
      isLoading: productLoading,
      error: productError,
    } = useGetRequest(`/v1/products/${product?.productId}`, true);

    const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
    const [editMode, setEditMode] = useState<boolean>(false);

    useEffect(() => {
      const tentativeDevices =
        SaleStore.getSelectedTentativeDevices(
          currentProductId,
          currentInventoryId
        ) || [];
      setSelectedDeviceIds(tentativeDevices);
    }, [currentProductId, currentInventoryId]);

    const selectedLinkedDevices: DeviceResponse[] = filteredDevices
      ? filteredDevices.filter(
          (device) => selectedDeviceIds && selectedDeviceIds.includes(device.id)
        )
      : [];

    const addDeviceId = (id: string) => {
      setSelectedDeviceIds((prev) => {
        const newIds = Array.from(new Set([...prev, id])); // avoid duplicates
        return newIds;
      });
    };

    const removeDeviceId = (id: string) => {
      setSelectedDeviceIds((prev) => prev.filter((item) => item !== id));
    };

    const requiredDevices: number =
      productData?.inventories?.reduce((sum: number, inventory: any) => {
        const quantity = Number(inventory?.productInventoryQuantity) || 0;
        return sum + quantity;
      }, 0) || 0;

    const filterDevices = async () => {
      const newParams: Record<string, string> = {};
      if (searchTerm.trim()) {
        if (filterKey) newParams[filterKey] = searchTerm;
        else newParams.serialNumber = searchTerm;
      }
      return newParams;
    };

    const fetchDevice = async () => {
      setLoading(true);
      const newParams = await filterDevices();
      try {
        const response = await apiCall({
          endpoint: `/v1/device?${new URLSearchParams(newParams).toString()}`,
          method: "get",
          successMessage: "",
          showToast: false,
        });
        const devices = response.data?.devices || [];
        setFilteredDevices(devices);
      } catch (error) {
        console.error("Error fetching devices:", error);
        setFilteredDevices([]);
      }
      setLoading(false);
    };

    const handleCreateDevice = async () => {
      setLoading(true);
      try {
        const validatedData = {
          ...formData,
          count: formData.count.toString(),
        };
        await apiCall({
          endpoint: "/v1/device",
          method: "post",
          data: validatedData,
          successMessage: "Device created successfully!",
        });
        await mutate();
        setCreateDevice(false);
        setLinkView("selectDevice");
        setDescription(prevDescription ? prevDescription : "Select Device");
        setFormData(defaultFormData);
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          setFormErrors(error.issues);
        } else {
          const message =
            error?.response?.data?.message || "Internal Server Error";
          setApiError(`Device creation failed: ${message}.`);
        }
      } finally {
        setLoading(false);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      if (name === "searchTerm") {
        setSearchTerm(value);
        e.preventDefault();
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }));
      }
      setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
      setApiError(null);
    };

    const isFormFilled = Boolean(formData.serialNumber && formData.key);
    const getFieldError = (fieldName: string) => {
      return formErrors.find((error) => error.path[0] === fieldName)?.message;
    };

    const toggleDeviceSelection = (id: string) => {
      setSelectedDevices((prev) => {
        const isCurrentlySelected = prev.includes(id);
        const newSelected = isCurrentlySelected
          ? prev.filter((sn) => sn !== id)
          : [...prev, id];

        // Sync with store and selectedDeviceIds
        if (isCurrentlySelected) {
          // Remove device
          SaleStore.removeSingleTentativeDevice(
            currentProductId,
            id.toString(),
            currentInventoryId
          );
          removeDeviceId(id);
        } else {
          // Add device
          SaleStore.addOrUpdateTentativeDevices(
            currentProductId,
            [id.toString()],
            currentInventoryId
          );
          addDeviceId(id);
        }

        return newSelected;
      });
    };

    const linkDevice = () => {
      if (selectedDevices.length !== requiredQuantity) return;

      // Get existing tentative devices
      const existingDevices =
        SaleStore.getSelectedTentativeDevices(
          currentProductId,
          currentInventoryId
        ) || [];

      // Merge with new selections, avoiding duplicates
      const validDevices = [
        ...new Set([
          ...existingDevices,
          ...selectedDevices.map((device) => device.toString()),
        ]),
      ];

      SaleStore.addOrUpdateTentativeDevices(
        currentProductId,
        validDevices,
        currentInventoryId
      );
      handleCancel();
    };

    const linkedStoreCount =
      SaleStore.getAllTentativeDevices(currentProductId)?.length || 0;

    const saveForm = () => {
      if (linkedStoreCount !== requiredDevices) return;

      // Get current tentative devices
      const tentativeDevices =
        SaleStore.getSelectedTentativeDevices(currentProductId) || [];

      // Ensure all IDs are strings
      const validDevices = tentativeDevices.map((d) => String(d));

      // Update devices in store
      SaleStore.addOrUpdateDevices(currentProductId, validDevices);
      SaleStore.addSaleItem(currentProductId);
      handleClose();
    };

    const handleCancel = () => {
      setSearchTerm("");
      setFilterKey("search");
      setCreateDevice(false);
      setToggleFilter(false);
      setFormData(defaultFormData);
      setFormErrors([]);
      setApiError(null);
      setFilteredDevices(null);
      setCreateDevice(false);
      setLinkView("");
      setDescription("Link Device(s)");
      setPrevDescription("");
      setRequiredQuantity(0);
      setSelectedDevices([]);
      setSelectedDeviceIds([]);
      setCurrentInventoryId("");
      setLinkedDevicesCount(0);
      setEditMode(false);
    };

    revalidateStore(SaleStore);

    const filteredAvailableDevices = (data?.devices || []).filter(
      (device: DeviceResponse) => {
        const allLinkedDevices: string[] =
          SaleStore.getAllTentativeDevices(currentProductId);

        return (
          !allLinkedDevices.includes(device.id) &&
          !selectedDevices.includes(device.id)
        );
      }
    );

    const saleDevicesExist = () => {
      const devices: string[] =
        SaleStore.getTransformedSaleItems().find(
          (s) => s.productId === currentProductId
        )?.devices || [];

      const sumInventories =
        productData?.inventories?.reduce(
          (sum: any, inv: any) => sum + (inv?.productInventoryQuantity || 0),
          0
        ) || 0;

      return devices?.length === sumInventories;
    };

    const allTentativeDevices: string[] =
      SaleStore.getAllTentativeDevices(currentProductId);

    if (editMode) {
      const linkedDevices =
        SaleStore.getTentativeDevicesByInventory(
          currentProductId,
          currentInventoryId
        ) || [];

      const inventory = productData?.inventories?.find(
        (inv: any) => inv.id === currentInventoryId
      );

      return (
        <div className="flex flex-col h-full max-h-[400px] gap-4">
          <div className="flex flex-col items-center justify-between">
            <h3 className="text-sm font-medium text-center ">
              Remove Selected Devices for {inventory?.name || "Inventory"}
            </h3>
            <div className="text-sm text-gray-600">
              {linkedDevices.length} device(s) linked
            </div>
          </div>

          <div className="overflow-auto flex-1 border border-strokeGreyTwo rounded-md bg-white">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="text-sm p-3 text-left border-b border-gray-300 w-full whitespace-nowrap">
                    S/N
                  </th>
                  <th className="text-sm p-3 text-left border-b border-gray-300 w-full whitespace-nowrap">
                    Key
                  </th>
                  <th className="text-sm p-3 text-left border-b border-gray-300 w-full whitespace-nowrap">
                    Hardware Model
                  </th>
                  <th className="text-sm p-3 text-left border-b border-gray-300 w-full whitespace-nowrap">
                    Firmware Version
                  </th>
                </tr>
              </thead>
              <tbody>
                {linkedDevices.map((deviceId) => {
                  const device = data?.devices?.find(
                    (d: DeviceResponse) => d.id === deviceId
                  );
                  return device ? (
                    <tr
                      key={device.serialNumber}
                      onClick={() => toggleDeviceSelection(device.id)}
                      className="border-b border-gray-200 hover:bg-red-700/15 text-sm cursor-pointer transition-colors"
                      title="Remove Device"
                    >
                      <td className="text-sm p-3 whitespace-nowrap">
                        {device.serialNumber}
                      </td>
                      <td className="text-sm p-3 whitespace-nowrap">
                        {device.key}
                      </td>
                      <td className="text-sm p-3 whitespace-nowrap">
                        {device.hardwareModel}
                      </td>
                      <td className="text-sm p-3 whitespace-nowrap">
                        {device.firmwareVersion}
                      </td>
                    </tr>
                  ) : (
                    <tr key={deviceId} className="border-b border-gray-200">
                      <td colSpan={5} className="text-sm p-3 text-center">
                        Device {deviceId} not found
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <SecondaryButton
              variant="primary"
              children="Done"
              onClick={handleCancel}
              className="w-24"
            />
          </div>
        </div>
      );
    }

    return (
      <form className="flex flex-col justify-between h-full max-h-[400px] gap-2">
        {createDevice && linkView === "createDevice" ? (
          <div className="space-y-4 max-h-[360px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="serialNumber"
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"
                >
                  <Asterik />
                  Serial Number
                </label>
                <input
                  type="text"
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  required={true}
                  className="w-full px-3 py-2 border rounded-md outline-none transition-colors border-gray-300 focus:border-blue-500"
                  placeholder="Enter serial number"
                />
                {getFieldError("serialNumber") && (
                  <p className="text-xs text-red-500 mt-1">
                    {getFieldError("serialNumber")}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="key"
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"
                >
                  <Asterik />
                  Key
                </label>
                <input
                  type="text"
                  id="key"
                  name="key"
                  value={formData.key}
                  onChange={handleInputChange}
                  required={true}
                  className="w-full px-3 py-2 border rounded-md outline-none transition-colors border-gray-300 focus:border-blue-500"
                  placeholder="Enter key"
                />
                {getFieldError("key") && (
                  <p className="text-xs text-red-500 mt-1">
                    {getFieldError("key")}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="startingCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Starting Code
                </label>
                <input
                  type="text"
                  id="startingCode"
                  name="startingCode"
                  value={formData.startingCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md outline-none transition-colors border-gray-300 focus:border-blue-500"
                  placeholder="Enter starting code"
                />
              </div>
              <div>
                <label
                  htmlFor="count"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Count
                </label>
                <input
                  type="number"
                  id="count"
                  name="count"
                  value={formData.count}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md outline-none transition-colors border-gray-300 focus:border-blue-500"
                  placeholder="Enter count"
                  min={0}
                />
              </div>
              <div>
                <label
                  htmlFor="timeDivider"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Time Divider
                </label>
                <input
                  type="text"
                  id="timeDivider"
                  name="timeDivider"
                  value={formData.timeDivider}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md outline-none transition-colors border-gray-300 focus:border-blue-500"
                  placeholder="Enter time divider"
                />
              </div>
              <div>
                <label
                  htmlFor="hardwareModel"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Hardware Model
                </label>
                <input
                  type="text"
                  id="hardwareModel"
                  name="hardwareModel"
                  value={formData.hardwareModel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md outline-none transition-colors border-gray-300 focus:border-blue-500"
                  placeholder="Enter hardware model"
                />
              </div>
              <div>
                <label
                  htmlFor="firmwareVersion"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Firmware Version
                </label>
                <input
                  type="text"
                  id="firmwareVersion"
                  name="firmwareVersion"
                  value={formData.firmwareVersion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md outline-none transition-colors border-gray-300 focus:border-blue-500"
                  placeholder="Enter firmware version"
                />
              </div>
              <div className="flex items-center w-full gap-4 col-span-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="restrictedDigitMode"
                    checked={formData.restrictedDigitMode}
                    onChange={handleInputChange}
                    className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Restricted Digit Mode
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isTokenable"
                    checked={formData.isTokenable}
                    onChange={handleInputChange}
                    className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Tokenable
                  </span>
                </label>
              </div>
            </div>

            {apiError && (
              <p className="text-sm text-red-500 mt-2">{apiError}</p>
            )}
            <div className="flex items-center justify-between gap-1">
              <SecondaryButton
                variant="secondary"
                children="Cancel"
                onClick={() => {
                  setCreateDevice(false);
                  setLinkView("selectDevice");
                  setDescription(
                    prevDescription ? prevDescription : "Select Device"
                  );
                }}
              />
              <SecondaryButton
                disabled={!isFormFilled}
                loading={loading}
                loadingText="Creating"
                children="Create Device"
                onClick={handleCreateDevice}
              />
            </div>
          </div>
        ) : (
          <>
            <div>
              {linkView === "" ? null : (
                <div className="space-y-2">
                  {toggleFilter && (
                    <div className="flex items-center justify-between w-full gap-1 transition-all">
                      <p className="w-[25%] font-semibold">Set Filter:</p>
                      <select
                        value={filterKey}
                        onChange={(e) => {
                          e.preventDefault();
                          setFilterKey(
                            e.target.value as keyof DeviceFormSchema
                          );
                        }}
                        className="w-[75%] px-3 py-2 border rounded-md outline-none transition-colors border-gray-300 focus:border-blue-500"
                      >
                        {filterShape.map((filter, index) => (
                          <option key={index} value={filter.value}>
                            {filter.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="relative">
                    <input
                      type="text"
                      name="searchTerm"
                      value={searchTerm}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          filterDevices();
                          fetchDevice();
                        }
                      }}
                      onBlur={() => {
                        if (searchTerm) {
                          filterDevices();
                          fetchDevice();
                        }
                      }}
                      placeholder="Search devices..."
                      className="w-full px-4 py-2 pr-10 border rounded-md outline-none transition-colors border-gray-300 focus:border-blue-500"
                    />
                    <div className="flex items-center justify-between absolute right-3 top-1/2 -translate-y-1/2 w-max gap-2 cursor-pointer">
                      <IoIosSearch
                        className="text-textDarkGrey w-5 h-5"
                        title={`${
                          filterKey === "search"
                            ? "Perform Search"
                            : `Search by ${
                                filterShape.find(
                                  (filter) => filter.value === filterKey
                                )?.name
                              }`
                        }`}
                        onClick={() => {
                          filterDevices();
                          fetchDevice();
                        }}
                      />
                      <span
                        title={toggleFilter ? "Reset Filter" : "Apply Filter"}
                        onClick={() => {
                          if (toggleFilter) {
                            setFilterKey("search");
                            setFilteredDevices(null);
                          }
                          setToggleFilter(!toggleFilter);
                        }}
                      >
                        {toggleFilter ? (
                          <MdFilterListOff className="text-errorTwo w-5 h-5" />
                        ) : (
                          <MdFilterList className="text-textDarkGrey w-5 h-5" />
                        )}
                      </span>
                      <span
                        title="Create Device"
                        onClick={() => {
                          setCreateDevice(true);
                          setLinkView("createDevice");
                          setDescription("Create Device");
                        }}
                      >
                        <HiPlus className="text-textDarkGrey w-5 h-5" />
                      </span>
                    </div>
                  </div>
                  {loading && (
                    <p className="text-xs text-textBlack text-center font-medium">
                      Searching...
                    </p>
                  )}
                  {filteredDevices !== null && !loading && (
                    <p className="text-xs text-textBlack text-center font-medium">
                      {filteredDevices?.length === 0 ? (
                        "No available devices found."
                      ) : (
                        <span className="flex items-center justify-between w-full gap-1">
                          <span
                            className={`cursor-pointer ${
                              showLinkedDevices ? "text-blue-500 underline" : ""
                            }`}
                            onClick={() => setShowLinkedDevices(false)}
                          >
                            {filteredAvailableDevices?.length === 0
                              ? ""
                              : "View"}{" "}
                            {filteredAvailableDevices?.length} available device
                            {filteredAvailableDevices?.length > 1
                              ? "s"
                              : ""}{" "}
                            found
                          </span>
                          <span
                            className={`cursor-pointer ${
                              !showLinkedDevices
                                ? "text-blue-500 underline"
                                : ""
                            }`}
                            onClick={() => setShowLinkedDevices(true)}
                          >
                            {selectedLinkedDevices?.length === 0 ? "" : "View"}{" "}
                            {selectedLinkedDevices &&
                              selectedLinkedDevices.length}{" "}
                            linked device
                            {selectedLinkedDevices?.length > 1 ? "s" : ""}
                          </span>
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {!loading &&
                filteredDevices === null &&
                (productLoading ? (
                  <p className="text-sm text-textBlack font-medium text-center mt-6">
                    Loading Product Inventories
                  </p>
                ) : productError ? (
                  <p className="text-sm text-textBlack font-medium text-center mt-6">
                    Failed to load product inventories
                  </p>
                ) : linkView === "" ? (
                  <div className="flex flex-col items-center justify-center w-full max-h-[410px] mt-2 gap-1">
                    <p className="text-sm text-textBlack font-medium">
                      {`Link the Product Inventor${
                        productData?.inventories?.length > 1 ? "ies" : "y"
                      } Below`}
                    </p>
                    <div className="w-full max-h-[340px] overflow-y-auto">
                      <div className="flex flex-col gap-2 items-center justify-start w-full pt-2 pr-3">
                        {productData?.inventories?.map(
                          (item: any, index: number) => {
                            const inventoryId =
                              item?.id ||
                              currentInventoryId ||
                              index.toString();
                            const linkedDevices =
                              SaleStore.getTentativeDevicesByInventory(
                                currentProductId,
                                inventoryId
                              ) || [];
                            const isFullyLinked =
                              linkedDevices.length >=
                              Number(item?.productInventoryQuantity);
                            const isPartiallyLinked =
                              linkedDevices.length > 0 && !isFullyLinked;

                            return (
                              <div
                                key={inventoryId}
                                className="flex items-center justify-between w-full gap-3"
                              >
                                <div
                                  className={`flex bg-white flex-col gap-2 w-full p-2.5 border-[0.6px] rounded-[20px] transition-colors ${
                                    isFullyLinked
                                      ? "border-green-500"
                                      : isPartiallyLinked
                                      ? "border-yellow-500"
                                      : "border-strokeGreyThree"
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <ProductDetailRow
                                        label="Inventory Name"
                                        value={
                                          truncateTextByWord(item?.name, 26) ||
                                          ""
                                        }
                                        title={item?.name || ""}
                                      />
                                      <ProductDetailRow
                                        label="Manufacturer Name"
                                        value={item?.manufacturerName || ""}
                                      />
                                      <ProductDetailRow
                                        label="Inventory Status"
                                        value={item?.status || ""}
                                      />
                                      <ProductDetailRow
                                        label="Quantity"
                                        value={
                                          item?.productInventoryQuantity || ""
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                                {isFullyLinked ? (
                                  <div
                                    className="flex items-center justify-center p-0.5 rounded-full border-[0.6px] bg-red-200 border-red-300 cursor-pointer transition-colors"
                                    onClick={() => {
                                      setCurrentInventoryId(inventoryId);
                                      setEditMode(true);
                                    }}
                                  >
                                    <TiEdit
                                      className="w-4 h-4 transition-colors text-red-600"
                                      title="Edit Devices Linked"
                                    />
                                  </div>
                                ) : (
                                  <div
                                    className={`flex items-center justify-center p-0.5 rounded-full border-[0.6px] ${
                                      isPartiallyLinked
                                        ? "bg-yellow-200 border-yellow-300"
                                        : "bg-slate-200 border-strokeGreyTwo"
                                    } cursor-pointer transition-colors`}
                                    onClick={() => {
                                      setLinkView("selectDevice");
                                      setDescription(
                                        `Select Devices for ${item?.name}`
                                      );
                                      setPrevDescription(
                                        `Select Devices for ${item?.name}`
                                      );
                                      setRequiredQuantity(
                                        item?.productInventoryQuantity
                                      );
                                      setCurrentInventoryId(inventoryId);
                                    }}
                                  >
                                    <LuPlus
                                      className={`w-4 h-4 transition-colors ${
                                        isPartiallyLinked
                                          ? "text-yellow-600"
                                          : "text-textDarkGrey"
                                      }`}
                                      title={
                                        isPartiallyLinked
                                          ? "Partially linked"
                                          : "Link Device"
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-center py-4">
                      <SecondaryButton
                        disabled={linkedStoreCount !== requiredDevices}
                        className={
                          linkedStoreCount === requiredDevices
                            ? "bg-green-500 hover:bg-green-600 transition-colors"
                            : ""
                        }
                        children={
                          saleDevicesExist()
                            ? "Update Linked Devices"
                            : linkedStoreCount === requiredDevices
                            ? `✓ Save Linked ${linkedStoreCount} Device${
                                linkedStoreCount > 1 ? "s" : ""
                              }`
                            : `Saved ${linkedStoreCount} of ${requiredDevices} Linked Device${
                                requiredDevices > 1 ? "s" : ""
                              }`
                        }
                        onClick={saveForm}
                      />
                    </div>
                  </div>
                ) : null)}

              {linkView === "" ? null : filteredDevices === null ||
                filteredDevices?.length === 0 ? null : (
                <div className="overflow-auto max-h-[220px] border border-strokeGreyTwo rounded-md bg-white mt-2">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="text-sm p-3 text-left border-b border-gray-300 w-full whitespace-nowrap">
                          S/N
                        </th>
                        <th className="text-sm p-3 text-left border-b border-gray-300 w-full whitespace-nowrap">
                          Key
                        </th>
                        <th className="text-sm p-3 text-left border-b border-gray-300 w-full whitespace-nowrap">
                          Hardware Model
                        </th>
                        <th className="text-sm p-3 text-left border-b border-gray-300 w-full whitespace-nowrap">
                          Firmware Version
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {showLinkedDevices
                        ? selectedLinkedDevices?.map((device) => (
                            <tr
                              key={device.serialNumber}
                              onClick={() => {
                                toggleDeviceSelection(device.id);
                                setLinkedDevicesCount((prev) => prev - 1);
                              }}
                              className="border-b border-gray-200 cursor-pointer hover:bg-red-100"
                            >
                              <td className="text-sm p-3 whitespace-nowrap">
                                {device.serialNumber}
                              </td>
                              <td className="text-sm p-3 whitespace-nowrap">
                                {device.key}
                              </td>
                              <td className="text-sm p-3 whitespace-nowrap">
                                {device.hardwareModel}
                              </td>
                              <td className="text-sm p-3 whitespace-nowrap">
                                {device.firmwareVersion}
                              </td>
                            </tr>
                          ))
                        : filteredAvailableDevices?.map(
                            (device: DeviceResponse) => (
                              <tr
                                key={device.serialNumber}
                                onClick={() => {
                                  if (
                                    (SaleStore.getTentativeDevicesByInventory(
                                      currentProductId,
                                      currentInventoryId
                                    )?.length || selectedDevices.length) ===
                                    requiredQuantity
                                  ) {
                                    return;
                                  } else {
                                    toggleDeviceSelection(device.id);
                                    setLinkedDevicesCount((prev) => prev + 1);
                                  }
                                }}
                                className={`border-b border-gray-200 
                                  ${
                                    allTentativeDevices.includes(device.id) ||
                                    (SaleStore.getTentativeDevicesByInventory(
                                      currentProductId,
                                      currentInventoryId
                                    )?.length || selectedDevices.length) ===
                                      requiredQuantity
                                      ? "cursor-not-allowed"
                                      : "cursor-pointer hover:bg-[#E3FAD6]"
                                  }
                                  `}
                              >
                                <td className="text-sm p-3 whitespace-nowrap">
                                  {device.serialNumber}
                                </td>
                                <td className="text-sm p-3 whitespace-nowrap">
                                  {device.key}
                                </td>
                                <td className="text-sm p-3 whitespace-nowrap">
                                  {device.hardwareModel}
                                </td>
                                <td className="text-sm p-3 whitespace-nowrap">
                                  {device.firmwareVersion}
                                </td>
                              </tr>
                            )
                          )}
                    </tbody>
                  </table>
                </div>
              )}

              {linkView === ""
                ? null
                : data?.length === 0 && (
                    <div className="text-center pt-2">
                      <p className="mb-2">No devices available.</p>
                      <button
                        type="button"
                        className="px-4 py-2 bg-success hover:bg-green-500 text-white rounded-md transition-colors flex items-center justify-center mx-auto"
                        onClick={() => {
                          setCreateDevice(true);
                          setLinkView("createDevice");
                          setDescription("Create Device");
                        }}
                      >
                        <FaPlus className="mr-2" />
                        Create Device
                      </button>
                    </div>
                  )}
            </div>

            {linkView === "" ? null : (
              <div className="flex flex-col w-full gap-1 px-5 pb-4 mt-4 absolute bottom-0 left-0">
                <p className="text-sm text-textBlack font-medium">
                  {`Selected ${
                    SaleStore.getTentativeDevicesByInventory(
                      currentProductId,
                      currentInventoryId
                    )?.length || linkedDevicesCount
                  } device${
                    SaleStore.getTentativeDevicesByInventory(
                      currentProductId,
                      currentInventoryId
                    )?.length || linkedDevicesCount > 1
                      ? "s"
                      : ""
                  } out of the required ${requiredQuantity}.`}
                </p>
                <div className="flex items-center justify-between gap-1">
                  <SecondaryButton
                    variant="secondary"
                    children="Back"
                    onClick={handleCancel}
                  />
                  <SecondaryButton
                    disabled={
                      (SaleStore.getTentativeDevicesByInventory(
                        currentProductId,
                        currentInventoryId
                      )?.length || selectedDevices.length) !== requiredQuantity
                    }
                    children={`Link Device${requiredQuantity > 1 ? "s" : ""}`}
                    onClick={linkDevice}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </form>
    );
  }
);

export default UploadDevicesForm;
