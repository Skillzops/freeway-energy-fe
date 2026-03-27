import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import SecondaryModal from "../ModalSecondary/SecondaryModal";
// import editInput from "../../assets/settings/editInput.svg";
import { DropDown } from "../DropDownComponent/DropDown";
import TabComponent from "../TabComponent/TabComponent";
import InventoryDetails from "./InventoryDetails";
import InventoryStats from "./InventoryStats";
import InventoryHistory, { Batch } from "./InventoryHistory";
import { GoDotFill } from "react-icons/go";
import { useApiCall, useGetRequest } from "../../utils/useApiCall";
import { KeyedMutator } from "swr";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import CreateInventoryBatchForm from "./CreateInventoryBatchForm";

type InventoryData = {
  id: string;
  name: string;
  manufacturerName: string;
  sku: string;
  image: string;
  dateOfManufacture: string | null;
  status: string;
  class: string;
  inventoryCategoryId: string;
  inventorySubCategoryId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  batches: Batch[];
  inventoryCategory: {
    id: string;
    name: string;
    parentId: string | null;
    type: string;
    // children?: {
    //   id: string;
    //   name: string;
    //   parentId: string;
    //   type: string;
    //   createdAt: string;
    //   updatedAt: string;
    // }[];
  };
  inventorySubCategory: {
    id: string;
    name: string;
    parentId: string | null;
    type: string;
  };
  salePrice: {
    minimumInventoryBatchPrice: number | null;
    maximumInventoryBatchPrice: number | null;
  };
  inventoryValue: number;
  totalRemainingQuantities: number;
  totalInitialQuantities: number;
};

export type TabNamesType = {
  name: string;
  key: string;
  count: number | null;
  id?: any;
};

const InventoryDetailModal = ({
  isOpen,
  setIsOpen,
  inventoryID,
  refreshTable,
  inventoryIdParamExists,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  inventoryID: string;
  refreshTable: KeyedMutator<any>;
  inventoryIdParamExists: boolean;
}) => {
  const { apiCall } = useApiCall();
  const fetchSingleBatchInventory = useGetRequest(
    `/v1/inventory/${inventoryID}`,
    false
  );
  const [displayInput, setDisplayInput] = useState<boolean>(false);
  const [tabContent, setTabContent] = useState<string>("details");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(20);
  const [secModal, setSecModal] = useState<boolean>(false);
  const [paramError, setParamError] = useState<boolean>(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState<boolean>(false);
  const [toggleVisibilityLoading, setToggleVisibilityLoading] =
    useState<boolean>(false);

  useEffect(() => {
    if (fetchSingleBatchInventory?.error && inventoryIdParamExists) {
      setParamError(true);
    }
  }, [fetchSingleBatchInventory?.error, inventoryIdParamExists]);

  const paginationInfo = () => {
    const total = fetchSingleBatchInventory?.data?.batches.length || 0;
    return {
      total,
      currentPage,
      entriesPerPage,
      setCurrentPage,
      setEntriesPerPage,
    };
  };

  const getInventoryData = (data: InventoryData) => {
    const entries = {
      inventoryId: data?.id,
      inventoryImage: data?.image,
      inventoryName: data?.name,
      inventoryClass: data?.class,
      inventoryCategory: data?.inventoryCategory?.name,
      sku: data?.sku,
      manufacturerName: data?.manufacturerName,
      dateOfManufacture: data?.dateOfManufacture,
      numberOfStock: data?.batches?.at(-1)?.numberOfStock || 0,
      remainingQuantity: data?.batches?.at(-1)?.remainingQuantity || 0,
      costPrice:
        data?.batches
          ?.slice()
          .reverse()
          .find((batch) => batch.costOfItem != null)?.costOfItem || 0,
      salePrice: data?.batches?.at(-1)?.price || 0,
      stockValue: data?.batches?.at(-1)?.stockValue || "",
    };
    return entries;
  };
  const inventoryData = useMemo(() => {
    return getInventoryData(fetchSingleBatchInventory?.data);
  }, [fetchSingleBatchInventory]);

  const handleCancelClick = () => setDisplayInput(false);

  const toggleInventoryVisibility = async () => {
    try {
      setToggleVisibilityLoading(true);
      await apiCall({
        endpoint: `/v1/inventory/${inventoryID}/toggle-hide`,
        method: "post",
        successMessage: "Inventory visibility updated successfully!",
      });
      await Promise.all([fetchSingleBatchInventory?.mutate(), refreshTable()]);
      setShowToggleConfirm(false);
    } catch (error) {
      console.error("Failed to toggle inventory visibility:", error);
    } finally {
      setToggleVisibilityLoading(false);
    }
  };

  const getStatsData = (data: InventoryData) => {
    // Early return if data is undefined or doesn't have batches
    if (!data || !data.batches || !data.batches.length) {
      return {
        allTimeStockNumber: 0,
        totalStockAvailable: 0,
        totalValueStockAvailable: 0,
        totalBatchesCreated: 0,
        percentageAvailable: "0%",
      };
    }

    const allTimeStockNumber = data.totalInitialQuantities;
    const totalStockAvailable = data.totalRemainingQuantities;
    const totalValueStockAvailable = data.inventoryValue;
    const percentageAvailable =
      data.batches.length > 0
        ? `${Math.round(
            ((data.batches[data.batches.length - 1]?.remainingQuantity ?? 0) /
              (data.batches[data.batches.length - 1]?.numberOfStock || 1)) *
              100
          )}%`
        : "0%";

    return {
      allTimeStockNumber,
      totalStockAvailable,
      totalValueStockAvailable: parseFloat(totalValueStockAvailable.toFixed(2)),
      totalBatchesCreated: data.batches.length,
      percentageAvailable,
    };
  };

  const statsData = useMemo(() => {
    return getStatsData(fetchSingleBatchInventory?.data);
  }, [fetchSingleBatchInventory]);

  const dropDownList = {
    items: [
      "Edit Inventory",
      "Create New Batch",
      "Toggle Visibility",
    ],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          setTabContent("details");
          setDisplayInput(true);
          break;
        case 1:
          setSecModal(true);
          break;
        case 2:
          setShowToggleConfirm(true);
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  const tabNames: TabNamesType[] = [
    { name: "Details", key: "details", count: null },
    { name: "Stats", key: "stats", count: null },
    {
      name: "Batch History",
      key: "history",
      count: fetchSingleBatchInventory?.data?.batches.length || 0,
    },
  ];

  const tagStyle = (value: string) => {
    if (value === "REGULAR") {
      return "bg-[#EAEEF2] text-textDarkGrey";
    } else if (value === "RETURNED") {
      return "bg-[#FFEBEC] text-errorTwo";
    } else {
      return "bg-[#FEF5DA] text-textDarkBrown";
    }
  };

  return (
    <>
      <Modal
        layout="right"
        bodyStyle="pb-44"
        isOpen={isOpen}
        onClose={() => {
          setTabContent("details");
          setDisplayInput(false);
          setShowToggleConfirm(false);
          setIsOpen(false);
        }}
        leftHeaderContainerClass="pl-2"
        rightHeaderComponents={
          displayInput ? (
            <p
              className="text-xs text-textDarkGrey font-semibold cursor-pointer over"
              onClick={handleCancelClick}
              title="Close edit mode"
            >
              Close Edit
            </p>
          ) : null
        }
        leftHeaderComponents={
          inventoryData.inventoryClass && (
            <span
              className={`${tagStyle(
                inventoryData.inventoryClass
              )} flex items-center justify-center gap-0.5 w-max px-2 h-[24px] text-xs uppercase rounded-full`}
            >
              <GoDotFill width={4} height={4} />
              {inventoryData.inventoryClass}
            </span>
          )
        }
        // rightHeaderComponents={
        //   displayInput ? (
        //     <p
        //       className="text-xs text-textDarkGrey font-semibold cursor-pointer over"
        //       onClick={handleCancelClick}
        //       title="Cancel editing inventory details"
        //     >
        //       Cancel Edit
        //     </p>
        //   ) : (
        //     <button
        //       className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-strokeGreyTwo rounded-full hover:bg-slate-100"
        //       onClick={() => setDisplayInput(true)}
        //     >
        //       <img src={editInput} alt="Edit Button" width="15px" />
        //     </button>
        //   )
        // }
      >
        <div className="bg-white">
          <header
            className={`flex items-center ${
              inventoryData.inventoryName ? "justify-between" : "justify-end"
            } bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree`}
          >
            {inventoryData.inventoryName && (
              <p className="flex items-center justify-center bg-[#F6F8FA] w-max px-2 py-1 h-[24px] text-textBlack text-xs border-[0.4px] border-strokeGreyTwo rounded-full">
                {inventoryData.inventoryName}
              </p>
            )}
            {!paramError && (
              <div className="flex items-center justify-end gap-2">
                <DropDown {...dropDownList} />
              </div>
            )}
          </header>
          <div className="flex flex-col w-full gap-4 px-4 py-2">
            <TabComponent
              tabs={tabNames.map(({ name, key, count }) => ({
                name,
                key,
                count,
              }))}
              onTabSelect={(key) => setTabContent(key)}
            />
            {tabContent === "details" ? (
              <DataStateWrapper
                isLoading={fetchSingleBatchInventory?.isLoading}
                error={fetchSingleBatchInventory?.error}
                errorStates={fetchSingleBatchInventory?.errorStates}
                refreshData={fetchSingleBatchInventory?.mutate}
                errorMessage={
                  paramError
                    ? "Failed to fetch inventory details. Invalid inventory Id"
                    : "Failed to fetch inventory details"
                }
              >
                <InventoryDetails
                  {...inventoryData}
                  tagStyle={tagStyle}
                  displayInput={displayInput}
                  setDisplayInput={setDisplayInput}
                  refreshTable={refreshTable}
                  refreshListView={fetchSingleBatchInventory?.mutate}
                />
              </DataStateWrapper>
            ) : tabContent === "stats" ? (
              <InventoryStats stats={statsData} />
            ) : tabContent === "history" ? (
              <InventoryHistory
                historyData={fetchSingleBatchInventory?.data?.batches}
                paginationInfo={paginationInfo}
                isLoading={fetchSingleBatchInventory?.isLoading}
              />
            ) : null}
          </div>
        </div>
      </Modal>
      <SecondaryModal
        isOpen={secModal}
        onClose={() => setSecModal(false)}
        description={`Create New Batch for ${inventoryData?.inventoryName}`}
      >
        <CreateInventoryBatchForm
          inventoryId={inventoryID}
          refreshTable={refreshTable}
          refreshListView={fetchSingleBatchInventory?.mutate}
          setSecModal={setSecModal}
          onClose={() => setSecModal(false)}
        />
      </SecondaryModal>
      <Modal
        layout="center"
        size="medium"
        isOpen={showToggleConfirm}
        onClose={() => {
          if (!toggleVisibilityLoading) setShowToggleConfirm(false);
        }}
      >
        <div className="w-full rounded-2xl bg-white border border-[#DDE4EE] p-4">
          <p className="text-base font-semibold text-textBlack">
            Toggle Visibility
          </p>
          <p className="mt-2 text-sm text-textLightGrey">
            Are you sure you want to toggle visibility for{" "}
            <span className="font-semibold text-textDarkGrey">
              {inventoryData?.inventoryName || "this inventory"}
            </span>
            ?
          </p>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              className="h-[38px] rounded-full border border-[#D4DCE8] bg-[#F6F8FA] px-5 text-sm font-medium text-textDarkGrey"
              onClick={() => setShowToggleConfirm(false)}
              disabled={toggleVisibilityLoading}
            >
              Cancel
            </button>
            <button
              className="h-[38px] rounded-full px-5 text-sm font-semibold text-white bg-gradient-to-r from-[#941C12] to-[#F4C541]"
              onClick={toggleInventoryVisibility}
              disabled={toggleVisibilityLoading}
            >
              {toggleVisibilityLoading ? "Toggling..." : "Yes, Toggle"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default InventoryDetailModal;
