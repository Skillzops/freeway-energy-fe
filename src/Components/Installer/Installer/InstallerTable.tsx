import { useState } from "react";
import { PaginationType, Table } from "../TableComponent/Table";
import { ApiErrorStatesType } from "../../utils/useApiCall";
import { KeyedMutator } from "swr";
import { ErrorComponent } from "@/Pages/ErrorPage";
import InstallationDetailModal from "./InstallationDetailmodal";

type InstallationType = {
  id: string;
  installationId: number;
  customerId: string;
  productType: string;
  googleAddress: string;
  tokenStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    location: string;
  };
  product: any; // Add product to the type
  device: any; // Add device to the type
};

interface InstallationEntries {
  id: string;
  datetime: string;
  customerName: string;
  productType: string;
  googleAddress: string;
  tokenStatus: string;
  status: string;
  email: string;
  phone: string;
}

const generateInstallationEntries = (data: any): InstallationEntries[] => {
  // Handle both old format (data.installations) and new format (data.data)
  const installations = data?.data || data?.installations || [];
  
  if (installations.length === 0) {
    return [];
  }
  
  const entries: InstallationEntries[] = installations.map((installation: any) => {
    return {
      id: installation?.id,
      datetime: installation?.createdAt,
      customerName: `${installation?.customer?.firstname} ${installation?.customer?.lastname}`,
      productType: installation?.sale?.saleItems?.[0]?.product?.name || installation?.productType || 'N/A',
      googleAddress: installation?.customer?.installationAddress || installation?.googleAddress || 'N/A',
      tokenStatus: installation?.sale?.saleItems?.[0]?.devices?.[0]?.isTokenable ? 'Active' : 'Inactive',
      status: installation?.status,
      email: installation?.customer?.email,
      phone: installation?.customer?.phone,
    };
  });
  return entries;
};

const InstallerTable = ({
  agentData,
  isLoading,
  refreshTable,
  error,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  agentData: any;
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  error: any;
  errorData: ApiErrorStatesType;
  paginationInfo: PaginationType;
  setTableQueryParams: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
}) => {
  const [isInstallationDetailModalOpen, setIsInstallationDetailModalOpen] = useState<boolean>(false);
  const [selectedInstallation, setSelectedInstallation] = useState<any>(null);
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);

  const filterList = [
    {
      name: "Token Status",
      items: ["All Token Status"],
      onClickLink: async (index: number) => {
        const data = ["all"];
        const query = data[index];
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          tokenStatus: query,
        }));
      },
    },
    {
      name: "Status",
      items: ["All Status"],
      onClickLink: async (index: number) => {
        const data = ["all"];
        const query = data[index];
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          status: query,
        }));
      },
    },
    {
      onDateClick: (date: string) => {
        setQueryValue(date);
        setIsSearchQuery(false);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          createdAt: date.split("T")[0],
        }));
      },
      isDate: true,
    },
  ];

  const getTableData = () => {
    const data = generateInstallationEntries(agentData);
    return data;
  };

  return (
    <>
      <InstallationDetailModal
        isOpen={isInstallationDetailModalOpen}
        onClose={() => {
          setIsInstallationDetailModalOpen(false);
          setSelectedInstallation(null);
        }}
        installationData={selectedInstallation}
      />
      {!error ? (
        <div className="w-full">
          <Table
            tableType="default"
            tableTitle="Installation History"
            tableClassname="w-full"
            tableData={getTableData()}
            loading={isLoading}
            filterList={filterList}
            columnList={[
              {
                title: "S/N",
                key: "id",
                customValue: (value, rowData) => {
                  const index = getTableData().findIndex(item => item.id === rowData.id);
                  return <span className="text-sm text-gray-700">{index + 1}</span>;
                },
              },
              {
                title: "DATE",
                key: "datetime",
                customValue: (value) => {
                  const date = new Date(value);
                  const day = date.getDate();
                  const month = date.toLocaleDateString('en-GB', { month: 'long' });
                  const year = date.getFullYear();
                  const suffix = day === 1 || day === 21 || day === 31 ? 'st' : 
                                day === 2 || day === 22 ? 'nd' : 
                                day === 3 || day === 23 ? 'rd' : 'th';
                  return (
                    <span className="text-sm text-gray-700">
                      {day}{suffix} {month} {year}
                    </span>
                  );
                },
              },
              {
                title: "CUSTOMER",
                key: "customerName",
                customValue: (value) => (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{value}</span>
                    <span className="text-yellow-500">😊</span>
                  </div>
                ),
              },
              {
                title: "PRODUCT TYPE",
                key: "productType",
                customValue: (value: string) => {
                  const parts = value.split(' ');
                  return (
                    <div className="flex gap-1">
                      {parts.map((part: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  );
                },
              },
              {
                title: "GOOGLE ADDRESS",
                key: "googleAddress",
                valueIsAComponent: true,
                customValue: (value) => {
                  const hasAddress = value && value.trim() !== '';
                  return (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${hasAddress ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-[10px] text-gray-700 font-medium">
                        {hasAddress ? 'YES' : 'NO'}
                      </span>
                    </div>
                  );
                },
              },
              {
                title: "TOKEN STATUS",
                key: "tokenStatus",
                valueIsAComponent: true,
                customValue: (value) => {
                  const status = value?.toLowerCase();
                  let dotColor = "bg-gray-500";
                  let textColor = "text-gray-700";
                  
                  switch (status) {
                    case 'active':
                      dotColor = "bg-green-500";
                      textColor = "text-green-700";
                      break;
                    case 'inactive':
                      dotColor = "bg-red-500";
                      textColor = "text-red-700";
                      break;
                    case 'pending':
                      dotColor = "bg-yellow-500";
                      textColor = "text-yellow-700";
                      break;
                    default:
                      break;
                  }
                  
                  return (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
                      <span className={`text-[12px] ${textColor} font-medium`}>{value}</span>
                    </div>
                  );
                },
              },
              {
                title: "ACTIONS",
                key: "actions",
                valueIsAComponent: true,
                customValue: (_value: any, rowData: any) => {
                  return (
                    <span
                      className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
                      onClick={() => {
                        // Handle both old format (installations) and new format (data)
                        const installations = agentData?.data || agentData?.installations || [];
                        
                        const originalInstallation = installations.find(
                          (inst: any) => inst.id === rowData.id
                        );
                        
                        // Re-shape the data to match what the modal expects
                        const modalData = originalInstallation ? {
                          id: originalInstallation.installationId || originalInstallation.id,
                          status: originalInstallation.status,
                          customer: {
                            name: `${originalInstallation.customer?.firstname} ${originalInstallation.customer?.lastname}`,
                            email: originalInstallation.customer?.email,
                            phone: originalInstallation.customer?.phone,
                          },
                          installation: {
                            address: originalInstallation.customer?.installationAddress || originalInstallation.googleAddress || 'N/A',
                            longitude: originalInstallation.customer?.longitude || "Not Available",
                            latitude: originalInstallation.customer?.latitude || "Not Available",
                          },
                          product: {
                            category: originalInstallation.sale?.saleItems?.[0]?.product?.category || originalInstallation.product?.category || "EAAS",
                            type: originalInstallation.sale?.saleItems?.[0]?.product?.name?.split(" ") || originalInstallation.product?.type?.split(" ") || ["EAAS", "RECHARGE"],
                            name: originalInstallation.sale?.saleItems?.[0]?.product?.name?.split(" ") || originalInstallation.product?.name?.split(" ") || ["EAAS", "124242"],
                            id: originalInstallation.sale?.saleItems?.[0]?.product?.id || originalInstallation.product?.id || "234242324",
                          },
                          device: {
                            id: originalInstallation.sale?.saleItems?.[0]?.devices?.[0]?.id || originalInstallation.device?.id || "234242324",
                            tokenStatus: originalInstallation.sale?.saleItems?.[0]?.devices?.[0]?.isTokenable ? 'Active' : 'Inactive',
                            deviceStatus: originalInstallation.sale?.saleItems?.[0]?.devices?.[0]?.installationStatus || originalInstallation.device?.status || "Active",
                          },
                          general: {
                            date: new Date(originalInstallation.createdAt).toLocaleDateString(),
                            time: new Date(originalInstallation.createdAt).toLocaleTimeString(),
                          },
                        } : null;

                        setSelectedInstallation(modalData);
                        setIsInstallationDetailModalOpen(true);
                      }}
                    >
                      View
                    </span>
                  );
                },
              },
            ]}
            refreshTable={refreshTable}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={paginationInfo}
            clearFilters={() => setTableQueryParams({})}
          />
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch installation history."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default InstallerTable;
