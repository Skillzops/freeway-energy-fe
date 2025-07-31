import React, { useState, useEffect } from "react";
import { Modal } from "../ModalComponent/Modal";
import TabComponent from "../TabComponent/TabComponent";
import { DropDown } from "../DropDownComponent/DropDown";
import { useGetRequest } from "../../utils/useApiCall";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import AgentDetails, { AgentUserType } from "./AgentDetails";
import AssignCustomersModal from "./AssignCustomersModal";
import AssignProductsModal from "./AssignProductsModal";
import AssignInstallersModal from "./AssignInstallersModal";
import TopUpWalletForm from "../TopUp/TopWalletForm";
import walletIcon from "../../assets/agents/wallet.svg";
import { KeyedMutator } from "swr";
import { toast } from "react-toastify";

// Extend the AgentUserType to include category
interface ExtendedAgentUserType extends AgentUserType {
  category?: string;
}

// Installers Table Component
const InstallersTable = ({ agentID }: { agentID: string }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  
  // Mock data for installers
  const mockInstallersData = [
    {
      id: "1",
      name: "Naomi Gambo",
      location: "Kaduna",
      installations: 1
    },
    {
      id: "2", 
      name: "Elizabeth Anigbogu",
      location: "Kaduna",
      installations: 5
    },
    {
      id: "3",
      name: "Stephen Akinyemi", 
      location: "Kaduna",
      installations: 3
    },
    {
      id: "4",
      name: "John Doe",
      location: "Lagos",
      installations: 2
    },
    {
      id: "5",
      name: "Jane Smith",
      location: "Abuja",
      installations: 4
    }
  ];

  return (
    <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-3 text-sm font-medium text-textDarkGrey">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-strokeGreyTwo rounded-full"></div>
                  S/N
                </div>
              </th>
              <th className="text-left p-3 text-sm font-medium text-textDarkGrey">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-strokeGreyTwo rounded-full"></div>
                  NAME
                </div>
              </th>
              <th className="text-left p-3 text-sm font-medium text-textDarkGrey">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-strokeGreyTwo rounded-full"></div>
                  LOCATION
                </div>
              </th>
              <th className="text-left p-3 text-sm font-medium text-textDarkGrey">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-strokeGreyTwo rounded-full"></div>
                  NO OF INSTALLATIONS
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {mockInstallersData.map((installer, index) => (
              <tr key={installer.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-3 text-sm text-textDarkGrey">
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td className="p-3 text-sm text-textDarkGrey">
                  {installer.name}
                </td>
                <td className="p-3 text-sm text-textDarkGrey">
                  {installer.location}
                </td>
                <td className="p-3 text-sm text-textDarkGrey">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 border border-gray-300 rounded-full text-xs font-medium">
                    {String(installer.installations).padStart(2, '0')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AgentModal = ({
  isOpen,
  setIsOpen,
  agentID,
  refreshTable,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  agentID: string;
  refreshTable: KeyedMutator<any>;
}) => {
  // const [displayInput, setDisplayInput] = useState<boolean>(false);
  const [tabContent, setTabContent] = useState<string>("agentDetails");
  const [isAssignCustomersModalOpen, setIsAssignCustomersModalOpen] = useState<boolean>(false);
  const [isAssignProductsModalOpen, setIsAssignProductsModalOpen] = useState<boolean>(false);
  const [isAssignInstallersModalOpen, setIsAssignInstallersModalOpen] = useState<boolean>(false);
  const [isWalletTopUpModalOpen, setIsWalletTopUpModalOpen] = useState<boolean>(false);

  const fetchSingleAgent = useGetRequest(`/v1/agents/${agentID}`, false);

  const generateAgentEntries = (data: any): ExtendedAgentUserType => {
    return {
      id: data?.id,
      firstname: data?.user?.firstname,
      lastname: data?.user?.lastname,
      email: data?.user?.email,
      phone: data?.user?.phone,
      location: data?.user?.location,
      longitude: data?.user?.longitude,
      latitude: data?.user?.latitude,
      addressType: data?.user?.addressType,
      status: data?.user?.status,
      emailVerified: data?.user?.emailVerified,
      category: data?.category,
    };
  };

  // const handleCancelClick = () => setDisplayInput(false);

  const dropDownList = {
    items: ["Assign Customer", "Assign Product", "Assign Installer", "Top Up wallet", "Block Sales Agent", "Cancel Agent"],
    onClickLink: (index: number) => {
      switch (index) {
        case 0:
          console.log("Assign Customer");
          setIsAssignCustomersModalOpen(true);
          break;
        case 1:
          console.log("Assign Product");
          setIsAssignProductsModalOpen(true);
          break;
        case 2:
          console.log("Assign Installer");
          setIsAssignInstallersModalOpen(true);
          break;
        case 3:
          console.log("Top Up wallet clicked - setting modal to open");
          setIsWalletTopUpModalOpen(true);
          console.log("Modal state should now be true");
          break;
        case 4:
          console.log("Block Sales Agent");
          // TODO: Implement block sales agent functionality
          break;
        case 5:
          console.log("Cancel Agent");
          // TODO: Implement cancel agent functionality
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  const tabNames = [
    { name: "Agent Details", key: "agentDetails", count: null },
    { name: "Customer", key: "customer", count: 0 },
    { name: "Installers", key: "installers", count: 5 },
    { name: "Inventory", key: "inventory", count: 0 },
    { name: "Products", key: "products", count: 0 },
    { name: "Devices", key: "devices", count: 0 },
    { name: "Transactions", key: "transactions", count: 0 },
    { name: "Stats", key: "stats", count: 0 },
    { name: "Sales", key: "sales", count: 0 },
    { name: "Tickets", key: "tickets", count: 0 }
  ];

  return (
    <>
      <Modal
        layout="right"
        size="large"
        bodyStyle="pb-44 overflow-auto"
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setTabContent("agentDetails");
          // setDisplayInput(false)
        }}
        rightHeaderComponents={
          fetchSingleAgent?.data?.user?.firstname ? (
            <div className="flex items-center gap-2 absolute left-4">
              <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
                {fetchSingleAgent?.data?.category || fetchSingleAgent?.data?.user?.category || "SALES"} AGENT
              </p>
              <p className="flex items-center gap-1 bg-paleLightBlue w-max p-2 h-[24px] text-success text-xs font-semibold rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {fetchSingleAgent?.data?.user?.status?.toUpperCase() || "ACTIVE"}
              </p>
            </div>
          ) : null
        }
      >
        <div className="bg-white">
          <header
            className={`flex items-center ${
              fetchSingleAgent?.data?.user?.firstname
                ? "justify-between"
                : "justify-end"
            } bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree`}
          >
            {fetchSingleAgent?.data?.user?.firstname ? (
              <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
                {fetchSingleAgent?.data?.user?.firstname}{" "}
                {fetchSingleAgent?.data?.user?.lastname}
              </p>
            ) : null}
            <div className="flex items-center justify-end gap-2">
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
            {tabContent === "agentDetails" ? (
              <DataStateWrapper
                isLoading={fetchSingleAgent?.isLoading}
                error={fetchSingleAgent?.error}
                errorStates={fetchSingleAgent?.errorStates}
                refreshData={fetchSingleAgent?.mutate}
                errorMessage="Failed to fetch agent details"
              >
                <AgentDetails
                  {...generateAgentEntries(fetchSingleAgent.data)}
                  refreshTable={refreshTable}
                  displayInput={false}
                />
              </DataStateWrapper>
            ) : tabContent === "installers" ? (
              <InstallersTable agentID={agentID} />
            ) : (
              <div>
                {tabNames?.find((item) => item.key === tabContent)?.name} Coming
                Soon
              </div>
            )}
          </div>
        </div>
      </Modal>
      
      {/* Assign Customers Modal */}
      <AssignCustomersModal
        isOpen={isAssignCustomersModalOpen}
        onClose={() => setIsAssignCustomersModalOpen(false)}
        agentID={agentID}
        onSuccess={() => {
          // Refresh agent data after assigning customers
          fetchSingleAgent.mutate();
        }}
      />
      
      {/* Assign Products Modal */}
      <AssignProductsModal
        isOpen={isAssignProductsModalOpen}
        onClose={() => setIsAssignProductsModalOpen(false)}
        agentID={agentID}
        onSuccess={() => {
          // Refresh agent data after assigning products
          fetchSingleAgent.mutate();
        }}
      />

      {/* Assign Installers Modal */}
      <AssignInstallersModal
        isOpen={isAssignInstallersModalOpen}
        onClose={() => setIsAssignInstallersModalOpen(false)}
        agentID={agentID}
        onSuccess={() => {
          fetchSingleAgent.mutate();
        }}
      />

      {/* Top Up Wallet Modal */}
      <Modal
        isOpen={isWalletTopUpModalOpen}
        onClose={() => {
          setIsWalletTopUpModalOpen(false);
        }}
        layout="right"
        size="small"
        bodyStyle="pb-44"
      >
        <div className="flex flex-col items-center bg-white">
          <div className="flex items-center justify-center gap-3 px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree bg-paleGrayGradientLeft">
            <img src={walletIcon} alt="wallet" className="w-6 h-6" />
            <h2 className="text-xl text-textBlack font-semibold font-secondary">
              Top Up Wallet
            </h2> 
          </div>
          
          <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
            <TopUpWalletForm
              handleClose={() => {
                setIsWalletTopUpModalOpen(false);
              }}
              refreshTable={fetchSingleAgent.mutate}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AgentModal;
