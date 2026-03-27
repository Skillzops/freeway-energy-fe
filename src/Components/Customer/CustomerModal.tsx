import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { Modal } from "@/Components/ModalComponent/Modal";
// import editInput from "../../assets/settings/editInput.svg";
import { DropDown } from "../DropDownComponent/DropDown";
import { useGetRequest, useApiCall } from "@/utils/useApiCall";
import { CustomerType } from "./CustomerTable";
import TabComponent from "../TabComponent/TabComponent";
// import { Icon } from "../Settings/UserModal";
// import call from "../../assets/settings/call.svg";
// import message from "../../assets/settings/message.svg";
import CustomerDetails, { DetailsType } from "./CustomerDetails";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import CustomerProductDetails from "./CustomerProductDetails";
import CustomerInteraction from "./CustomerInteraction";

const CustomerModal = ({
  isOpen,
  setIsOpen,
  customerID,
  refreshTable,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  customerID: string;
  refreshTable: KeyedMutator<any>;
}) => {
  const [displayInput, setDisplayInput] = useState<boolean>(false);
  const [tabContent, setTabContent] = useState<string>("customerDetails");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deletingCustomer, setDeletingCustomer] = useState<boolean>(false);

  const fetchSingleCustomer = useGetRequest(
    `/v1/customers/single/${customerID}`,
    false
  );
  const fetchInteractionStats = useGetRequest(
    `/v1/customers/${customerID}/interactions/stats`,
    true
  );
  const fetchInteractionFallbackCount = useGetRequest(
    `/v1/customers/${customerID}/interactions?page=1&limit=1`,
    true
  );

  const interactionCount =
    Number(fetchInteractionStats?.data?.totalInteractions) ||
    Number(fetchInteractionStats?.data?.total) ||
    Number(fetchInteractionStats?.data?.count) ||
    Number(fetchInteractionFallbackCount?.data?.total) ||
    Number(fetchInteractionFallbackCount?.data?.count) ||
    Number(fetchInteractionFallbackCount?.data?.pagination?.total) ||
    0;

  const { apiCall } = useApiCall();

  const generateCustomerEntries = (data: CustomerType): DetailsType => {
    return {
      customerId: data?.id,
      firstname: data?.firstname,
      lastname: data?.lastname,
      email: data?.email,
      phoneNumber: data?.phone,
      alternatePhone: data?.alternatePhone || "",
      gender: data?.gender || "",
      addressType: data?.addressType ?? "",
      installationAddress: data?.installationAddress || "",
      lga: data?.lga || "",
      state: data?.state || "",
      location: data?.location,
      longitude: data?.longitude || "",
      latitude: data?.latitude || "",
      idType: data?.idType || "",
      idNumber: data?.idNumber || "",
      type: data?.type || "",
      passportPhotoUrl: data?.passportPhotoUrl || "",
      idImageUrl: data?.idImageUrl || "",
      contractFormImageUrl: data?.contractFormImageUrl || "",
    };
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      setDeletingCustomer(true);
      await apiCall({
        endpoint: `/v1/customers/${customerId}`,
        method: "delete",
        successMessage: "Customer deleted successfully!",
      });
      setShowDeleteConfirm(false);
      setIsOpen(false);
      refreshTable();
    } catch (error) {
      console.error("Error deleting customer:", error);
    } finally {
      setDeletingCustomer(false);
    }
  };

  const dropDownList = {
    items: ["Delete Customer", "Edit Customer"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          setShowDeleteConfirm(true);
          break;
        case 1:
          setDisplayInput(true);
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  const tabNames = [
    { name: "Customer Details", key: "customerDetails", count: null },
    { name: "Product Details", key: "productDetails", count: null },
    { name: "Registration History", key: "registrationHistory", count: null },
    { name: "Contracts", key: "contracts", count: null },
    { name: "Customer Interaction", key: "customerInteraction", count: interactionCount },
    { name: "Transactions", key: "transactions", count: 0 },
    { name: "Tickets", key: "tickets", count: 0 },
  ];

  // const handleCallClick = () => {
  //   const callURL = `tel:${fetchSingleCustomer?.data?.phone}`;
  //   window.open(callURL, "_self");
  // };

  // const handleWhatsAppClick = () => {
  //   const whatsappURL = `https://wa.me/${fetchSingleCustomer?.data?.phone}`;
  //   window.open(whatsappURL, "_blank");
  // };

  return (
    <Modal
      layout="right"
      size="xlarge"
      bodyStyle="pb-44 overflow-auto"
      isOpen={isOpen}
      onClose={() => {
        setTabContent("customerDetails");
        setIsOpen(false);
        setDisplayInput(false);
        setShowDeleteConfirm(false);
      }}
      leftHeaderContainerClass="pl-2"
      // rightHeaderComponents={
      //   displayInput ? (
      //     <p
      //       className="text-xs text-textDarkGrey font-semibold cursor-pointer over"
      //       onClick={handleCancelClick}
      //       title="Cancel editing customer details"
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
            fetchSingleCustomer?.data?.firstname
              ? "justify-between"
              : "justify-end"
          } bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree`}
        >
          {fetchSingleCustomer?.data?.firstname && (
            <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
              {fetchSingleCustomer?.data?.firstname}{" "}
              {fetchSingleCustomer?.data?.lastname}
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            {/* <Icon icon={call} iconText="Call" handleClick={handleCallClick} />
            <Icon
              icon={message}
              iconText="Message"
              handleClick={handleWhatsAppClick}
            /> */}
            <DropDown {...dropDownList} />
          </div>
        </header>
        <div className="flex flex-col w-full gap-4 px-4 py-2">
          <TabComponent
            tabs={tabNames.map(({ name, key, count }) => ({
              name,
              key,
              count,
            }))}
            onTabSelect={(key) => setTabContent(key)}
            tabsContainerClass="p-2 rounded-[20px]"
          />
          {tabContent === "customerDetails" ? (
            <DataStateWrapper
              isLoading={fetchSingleCustomer?.isLoading}
              error={fetchSingleCustomer?.error}
              errorStates={fetchSingleCustomer?.errorStates}
              refreshData={fetchSingleCustomer?.mutate}
              errorMessage="Failed to fetch customer details"
            >
              <CustomerDetails
                {...generateCustomerEntries(fetchSingleCustomer?.data)}
                refreshTable={refreshTable}
                displayInput={displayInput}
              />
            </DataStateWrapper>
          ) : tabContent === "productDetails" ? (
            <DataStateWrapper
              isLoading={fetchSingleCustomer?.isLoading}
              error={fetchSingleCustomer?.error}
              errorStates={fetchSingleCustomer?.errorStates}
              refreshData={fetchSingleCustomer?.mutate}
              errorMessage="Failed to fetch product details"
            >
              <CustomerProductDetails customer={fetchSingleCustomer?.data} />
            </DataStateWrapper>
          ) : tabContent === "customerInteraction" ? (
            <CustomerInteraction customerId={customerID} />
          ) : (
            <div>
              {tabNames?.find((item) => item.key === tabContent)?.name} Coming
              Soon
            </div>
          )}
        </div>
      </div>
      <Modal
        layout="center"
        size="small"
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <div className="w-full rounded-2xl bg-white border border-[#DDE4EE] p-4">
          <p className="text-base font-semibold text-textBlack">Delete Customer</p>
          <p className="mt-2 text-sm text-textLightGrey">
            Are you sure you want to delete this customer? This action cannot be undone.
          </p>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              className="h-[36px] rounded-full border border-[#D4DCE8] bg-[#F6F8FA] px-4 text-sm font-medium text-textDarkGrey"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deletingCustomer}
            >
              Cancel
            </button>
            <button
              className="h-[36px] rounded-full px-4 text-sm font-semibold text-white"
              style={{ backgroundColor: "#901420" }}
              onClick={() => handleDeleteCustomer(customerID)}
              disabled={deletingCustomer}
            >
              {deletingCustomer ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};

export default CustomerModal;
