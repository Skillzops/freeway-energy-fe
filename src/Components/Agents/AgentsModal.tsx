import React, { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import TabComponent from "../TabComponent/TabComponent";
import { DropDown } from "../DropDownComponent/DropDown";
import { useGetRequest } from "../../utils/useApiCall";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import ListPagination from "../PaginationComponent/ListPagination";
import AgentDetails, { AgentUserType } from "./AgentDetails";
import AssignCustomersModal from "./AssignCustomersModal";
import AssignProductsModal from "./AssignProductsModal";
import AssignInstallersModal from "./AssignInstallersModal";
import TopUpWalletForm from "../TopUp/TopWalletForm";
import walletIcon from "../../assets/agents/wallet.svg";
import InstallationHistoryModal from "./InstallationHistoryModal";
import TaskHistoryModal from "./TaskHistoryModal";
import { KeyedMutator } from "swr";
import rootStore from "../../stores/rootStore";
import CommissionsTab from "./CommissionsTab";

// Extend the AgentUserType to include category
interface ExtendedAgentUserType extends AgentUserType {
  category?: string;
}

// Customer Table Component
const CustomerTable = ({ 
  agentID, 
  onAssignCustomers 
}: { 
  agentID: string;
  onAssignCustomers: () => void;
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage] = useState<number>(12);

  // Fetch all customers from the API
  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
    errorStates: customersErrorStates,
    mutate: refreshCustomers
  } = useGetRequest(
    `/v1/customers`,
    true,
    60000
  );



  // Get current assigned customers from store
  const { agentAssignmentStore } = rootStore;
  const storeAssignments = agentAssignmentStore.assignments;
  const storeAssignedData = storeAssignments.find(a => a.agentId === agentID);
  const storeAssignedCustomerIds = storeAssignedData?.customers?.map((customer: any) => customer.id || customer.customerId) || [];

  // For now, just use store data since the API endpoint returns forbidden
  const allAssignedCustomerIds = storeAssignedCustomerIds;

  // Filter customers to show only those currently assigned to this agent
  const allAssignedCustomers = customersData?.customers?.filter((customer: any) => 
    allAssignedCustomerIds.includes(customer.id)
  ) || [];

  // Use only customers loading state
  const isLoading = customersLoading;
  const error = customersError;
  const errorStates = customersErrorStates;
  const refreshData = refreshCustomers;

  // Transform assigned customers to table format
  const tableCustomersData = {
    data: allAssignedCustomers.map((customer: any, index: number) => ({
      id: customer.id || index + 1,
      user: { 
        firstname: customer.firstname || customer.user?.firstname || 'N/A', 
        lastname: customer.lastname || customer.user?.lastname || 'N/A' 
      },
      product: { 
        type: customer.productType || customer.product?.type || 'N/A', 
        paymentType: customer.paymentMode || customer.product?.paymentType || 'N/A' 
      },
      status: customer.status || 'ACTIVE',
      dueDate: customer.dueDate || 'N/A',
      phone: customer.phone || customer.user?.phone || 'N/A',
      email: customer.email || customer.user?.email || 'N/A',
      location: customer.location || customer.user?.location || 'N/A'
    }))
  };

  return (
    <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
      <DataStateWrapper
        isLoading={isLoading}
        error={error}
        errorStates={errorStates}
        refreshData={refreshData}
        errorMessage="Failed to fetch customers data"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-textBlack">Assigned Customers</h3>
          <span className="text-sm text-textGrey">
            {allAssignedCustomers.length} customer{allAssignedCustomers.length !== 1 ? 's' : ''} assigned
          </span>
        </div>
        {allAssignedCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Customer History</h3>
          <p className="text-sm text-gray-500 mb-4">This agent hasn't had any customers assigned yet.</p>
          <button 
            onClick={onAssignCustomers}
            className="px-4 py-2 bg-primaryGradient text-white rounded-full text-sm font-medium hover:bg-primary transition-colors"
          >
            Assign Customers
          </button>
        </div>
      ) : (
        <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-3 text-sm font-medium text-[#8990A5]">S/N</th>
              <th className="text-left p-3 text-sm font-medium text-[#8990A5]">NAME</th>
              <th className="text-left p-3 text-sm font-medium text-[#8990A5]">PRODUCT</th>
              <th className="text-left p-3 text-sm font-medium text-[#8990A5]">STATUS</th>
              <th className="text-left p-3 text-sm font-medium text-[#8990A5]">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
                {tableCustomersData?.data?.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map((customer: any, index: number) => (
              <tr key={customer.id} className="border-b border-[#F6F8FA]">
                <td className="p-3 text-sm text-textDarkGrey">
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td className="p-3 text-sm text-textDarkGrey">
                  {customer?.user?.firstname} {customer?.user?.lastname}
                </td>
                <td className="p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      customer?.product?.type === 'EAAS' ? 'bg-[#E3FAD6]' :
                      customer?.product?.type === 'SHS' ? 'bg-[#FDEEC2]' :
                      'bg-[#FDEEC2]'
                    }`}>
                      {customer?.product?.type || 'N/A'}
                    </span>
                    <span className="text-textDarkGrey">
                      {customer?.product?.paymentType || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-sm">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                    customer?.status === 'COMPLETED' ? 'bg-[#F6F8FA] text-[#00AF50]' :
                    customer?.status === 'DEFAULTED' ? 'bg-[#F6F8FA] text-[#FC4C5D]' :
                    'bg-[#F6F8FA] text-[#00AF50]'
                  }`}>
                    {customer?.status === 'DEFAULTED' ? `DEFAULTED: ${customer?.daysDefaulted || 29} DAYS` :
                     customer?.status === 'DUE' ? `DUE: ${customer?.dueDate || 'SEPT 11 2024'}` :
                     customer?.status || 'N/A'}
                  </span>
                </td>
                <td className="p-3">
                  <button className="px-4 py-1 text-xs bg-[#F6F8FA] text-textDarkGrey rounded-full hover:bg-gray-200">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-xs text-textGrey">
            Showing <span className="font-semibold">{(currentPage - 1) * entriesPerPage + 1}</span> to{" "}
              <span className="font-semibold">{Math.min(currentPage * entriesPerPage, tableCustomersData.data.length)}</span> of{" "}
              <span className="font-semibold">{tableCustomersData.data.length}</span> Customers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-textGrey">Page</span>
          <ListPagination
            currentPage={currentPage}
              totalItems={tableCustomersData.data.length}
            itemsPerPage={entriesPerPage}
            onPageChange={setCurrentPage}
            label="Customers"
          />
        </div>
      </div>
        </>
        )}
      </DataStateWrapper>
    </div>
  );
};

// Installers Table Component
const InstallersTable = ({ agentID }: { agentID: string }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage] = useState<number>(12);
  // First fetch agents data from API
  const {
    data: agentsData,
    isLoading: agentsLoading,
    error: agentsError,
    errorStates: agentsErrorStates,
    mutate: refreshAgents
  } = useGetRequest(
    `/v1/agents?category=INSTALLER`,
    true,
    60000
  );

  // Then fetch installers data for the specific agent
  const {
    data: installersData,
    isLoading: installersLoading,
    error: installersError,
    errorStates: installersErrorStates,
    mutate: refreshInstallers
  } = useGetRequest(
    agentID ? `/v1/agents/${agentID}` : null,
    !!agentID,
    60000
  );

  const isLoading = agentsLoading || installersLoading;
  const error = agentsError || installersError;
  const errorStates = agentsErrorStates || installersErrorStates;

  return (
    <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
      <DataStateWrapper
        isLoading={isLoading}
        error={error}
        errorStates={errorStates}
        refreshData={async () => {
          await Promise.all([refreshAgents(), refreshInstallers()]);
        }}
        errorMessage="Failed to fetch data"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-2 text-xs font-medium text-[#8990A5]">
                    S/N
                </th>
                <th className="text-left p-2 text-xs font-medium text-[#8990A5]">
                    AGENT NAME
                </th>
                <th className="text-left p-2 text-xs font-medium text-[#8990A5]">
                    LOCATION
                </th>
                <th className="text-left p-2 text-xs font-medium text-[#8990A5]">
                  ASSIGNED
                </th>
                <th className="text-left p-2 text-xs font-medium text-[#8990A5]">
                    STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {agentsData?.agents?.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage).map((agent: any, index: number) => (
                <tr key={agent.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3 text-sm text-textDarkGrey">
                    {String((currentPage - 1) * entriesPerPage + index + 1).padStart(2, '0')}
                  </td>
                  <td className="p-3 text-sm text-textDarkGrey">
                    {agent.user?.firstname} {agent.user?.lastname}
                  </td>
                  <td className="p-3 text-sm text-textDarkGrey">
                    {agent.user?.location || 'N/A'}
                  </td>
                  <td className="p-3 text-sm text-textDarkGrey">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 border border-gray-300 rounded-full text-xs font-medium">
                      {String(agent.installers?.length || 0).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-textDarkGrey">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      agent.user?.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {agent.user?.status?.toUpperCase() || 'INACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-xs text-textGrey">
              Showing <span className="font-semibold">{(currentPage - 1) * entriesPerPage + 1}</span> to{" "}
              <span className="font-semibold">{Math.min(currentPage * entriesPerPage, agentsData?.agents?.length || 0)}</span> of{" "}
              <span className="font-semibold">{agentsData?.agents?.length || 0}</span> Installers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-textGrey">Page</span>
            <ListPagination
              currentPage={currentPage}
              totalItems={agentsData?.agents?.length || 0}
              itemsPerPage={entriesPerPage}
              onPageChange={setCurrentPage}
              label="Installers"
            />
          </div>
        </div>
      </DataStateWrapper>
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
  const [isInstallationHistoryModalOpen, setIsInstallationHistoryModalOpen] = useState<boolean>(false);
  const [selectedInstallationId, setSelectedInstallationId] = useState<string | null>(null);
  const [isTaskHistoryModalOpen, setIsTaskHistoryModalOpen] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

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

  // Get assigned data from store
  const { agentAssignmentStore } = rootStore;
  const assignments = agentAssignmentStore.assignments;
  const assignedData = assignments.find(a => a.agentId === agentID);
  const assignedCustomersCount = assignedData?.customers?.length || 0;

  // Fetch installers data for the count
  const {
    data: installersCountData,
    isLoading: installersCountLoading,
  } = useGetRequest(
    `/v1/agents?category=INSTALLER`,
    true,
    60000
  );

  // Get agent category to determine which tabs to show
  const agentCategory = fetchSingleAgent?.data?.category || fetchSingleAgent?.data?.user?.category || "SALES";

  // Get dropdown items based on agent category
  const getDropdownItems = () => {
    if (agentCategory === "INSTALLER") {
      return ["Assign to Agent", "Block", "Cancel"];
    } else {
      return ["Assign Customer", "Assign Product", "Assign Installer", "Top Up wallet", "Block Sales Agent", "Cancel Agent"];
    }
  };

  const dropDownList = {
    items: getDropdownItems(),
    onClickLink: (index: number) => {
      if (agentCategory === "INSTALLER") {
        // Installer agent dropdown actions
        switch (index) {
          case 0:
            console.log("Top Up wallet clicked - setting modal to open");
            setIsWalletTopUpModalOpen(true);
            break;
          case 1:
            console.log("Block Installer Agent");
            // TODO: Implement block installer agent functionality
            break;
          case 2:
            console.log("Cancel Installer Agent");
            // TODO: Implement cancel installer agent functionality
            break;
          default:
            break;
        }
      } else {
        // Sales agent dropdown actions
        switch (index) {
          case 0:
            console.log("Assign to Agent");
            setIsAssignCustomersModalOpen(true);
            break;
          case 1:
            console.log("Block");
            setIsAssignProductsModalOpen(true);
            break;
          case 2:
            console.log("Assign Installer");
            setIsAssignInstallersModalOpen(true);
            break;
          case 3:
            console.log("Top Up wallet clicked - setting modal to open");
            setIsWalletTopUpModalOpen(true);
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
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  // Fetch installation count for installer agents
  const {
    data: installationData,
    isLoading: installationLoading,
    error: installationError,
    errorStates: installationErrorStates,
    mutate: refreshInstallations
  } = useGetRequest(
    agentCategory === "INSTALLER" ? `/v1/installer/installation-history/` : null,
    agentCategory === "INSTALLER",
    60000
  );

  // Fetch task history count for installer agents
  const {
    data: taskData,
    isLoading: taskLoading,
    error: taskError,
    errorStates: taskErrorStates,
    mutate: refreshTasks
  } = useGetRequest(
    agentCategory === "INSTALLER" ? `/v1/installer/task-history/` : null,
    agentCategory === "INSTALLER",
    60000
  );

  // Define tabs based on agent category
  const getTabNames = () => {
    if (agentCategory === "INSTALLER") {
      return [
        { name: "Agent Details", key: "agentDetails", count: null },
        { name: "Installation History", key: "installationHistory", count: installationData?.total || 0 },
        { name: "Task History", key: "taskHistory", count: taskData?.total || 0 },
        { name: "Commissions", key: "commissions", count: null },
      ];
    } else {
      return [
        { name: "Agent Details", key: "agentDetails", count: null },
        { name: "Customer", key: "customer", count: assignedCustomersCount },
        { name: "Installers", key: "installers", count: installersCountData?.agents?.length || 0 },
        { name: "Inventory", key: "inventory", count: 0 },
        { name: "Products", key: "products", count: assignedData?.products?.length || 0 },
        { name: "Devices", key: "devices", count: 0 },
        { name: "Transactions", key: "transactions", count: 0 },
        { name: "Stats", key: "stats", count: 0 },
        { name: "Sales", key: "sales", count: 0 },
        { name: "Tickets", key: "tickets", count: 0 },
        { name: "Commissions", key: "commissions", count: null },
      ];
    }
  };

  const tabNames = getTabNames();

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
                  onClose={() => setIsOpen(false)}
                />
              </DataStateWrapper>
            ) : tabContent === "customer" ? (
              <CustomerTable 
                agentID={agentID} 
                onAssignCustomers={() => setIsAssignCustomersModalOpen(true)}
              />
            ) : tabContent === "installers" ? (
              <InstallersTable agentID={agentID} />
            ) : tabContent === "installationHistory" ? (
              <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
                <div className="flex items-center justify-between p-4">
                  <h3 className="text-lg font-semibold text-textBlack">Installation History</h3>
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <DataStateWrapper
                    isLoading={installationLoading}
                    error={installationError}
                    errorStates={installationErrorStates}
                    refreshData={refreshInstallations}
                    errorMessage="Failed to fetch installation history"
                  >
                    {installationData?.installations?.length > 0 ? (
                      installationData.installations.map((installation: any) => (
                        <div 
                          key={installation.id}
                          className="flex items-center justify-between p-3 border border-strokeGreyTwo rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            setSelectedInstallationId(installation.id);
                            setIsInstallationHistoryModalOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-semibold text-textBlack">Installation #{installation.id}</p>
                              <p className="text-xs text-textGrey">{installation.customer?.firstname} {installation.customer?.lastname}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              installation.status === "INSTALLED" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {installation.status}
                            </span>
                            <span className="text-xs text-textGrey">{new Date(installation.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-textGrey">
                        <p>No installation history found</p>
                      </div>
                    )}
                  </DataStateWrapper>
                </div>
              </div>
            ) : tabContent === "commissions" ? (
              <CommissionsTab agentID={agentID} />
            ) : tabContent === "taskHistory" ? (
              <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
                <div className="flex items-center justify-between p-4">
                  <h3 className="text-lg font-semibold text-textBlack">Task History</h3>
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <DataStateWrapper
                    isLoading={taskLoading}
                    error={taskError}
                    errorStates={taskErrorStates}
                    refreshData={refreshTasks}
                    errorMessage="Failed to fetch task history"
                  >
                    {taskData?.tasks?.length > 0 ? (
                      taskData.tasks.map((task: any) => (
                        <div 
                          key={task.id}
                          className="flex items-center justify-between p-3 border border-strokeGreyTwo rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            setIsTaskHistoryModalOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-semibold text-textBlack">Task #{task.id}</p>
                              <p className="text-xs text-textGrey">{task.customer?.firstname} {task.customer?.lastname}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              task.status === "DONE" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {task.status}
                            </span>
                            <span className="text-xs text-textGrey">{new Date(task.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-textGrey">
                        <p>No task history found</p>
                      </div>
                    )}
                  </DataStateWrapper>
                </div>
              </div>
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

      {/* Installation History Modal */}
      <InstallationHistoryModal
        isOpen={isInstallationHistoryModalOpen}
        onClose={() => {
          setIsInstallationHistoryModalOpen(false);
          setSelectedInstallationId(null);
        }}
        installationId={selectedInstallationId}
      />

      {/* Task History Modal */}
      <TaskHistoryModal
        isOpen={isTaskHistoryModalOpen}
        onClose={() => {
          setIsTaskHistoryModalOpen(false);
          setSelectedTaskId(null);
        }}
        taskId={selectedTaskId}
      />
    </>
  );
};

export default AgentModal;
