import { useState } from "react";
// import { PaginationType, Table } from "../TableComponent/Table";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { KeyedMutator } from "swr";
import { ErrorComponent } from "@/Pages/ErrorPage";
import clockIcon from "@/assets/table/clock.svg";
import smile from "@/assets/table/smile.svg";
import TaskHistoryModal from "./TaskHistoryModal";
import { useGetRequest } from "@/utils/useApiCall";
import { Table } from "../TableComponent/Table";

type TaskType = {
  id: string;
  taskId: string;
  productType: string;
  warehouse: string;
  installationAddress: string;
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
};

interface TaskEntries {
  id: string;
  datetime: string;
  customerName: string;
  productType: string;
  warehouse: string;
  installationAddress: string;
  status: string;
}

const generateTaskEntries = (data: any): TaskEntries[] => {
  // Handle different possible data structures
  const tasks = data?.data || data?.tasks || [];
  
  if (tasks.length === 0) {
    return [];
  }
  
  const entries: TaskEntries[] = tasks.map((task: any) => {
    return {
      id: task?.id,
      datetime: task?.createdAt,
      customerName: `${task?.customer?.firstname} ${task?.customer?.lastname}`,
      productType: task?.productType || task?.sale?.saleItems?.[0]?.product?.name || 'N/A',
      warehouse: task?.warehouse || 'N/A',
      installationAddress: task?.installationAddress || task?.customer?.installationAddress || 'N/A',
      status: task?.status,
    };
  });
  return entries;
};

const TaskHistoryTable = ({
  currentPage,
  entriesPerPage,
  setCurrentPage,
  setEntriesPerPage,
  setTableQueryParams,
  tableQueryParams,
}: {
  currentPage: number;
  entriesPerPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setEntriesPerPage: React.Dispatch<React.SetStateAction<number>>;
  setTableQueryParams: React.Dispatch<React.SetStateAction<Record<string, any> | null>>;
  tableQueryParams: Record<string, any> | null;
}) => {
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);
  const [isTaskHistoryModalOpen, setIsTaskHistoryModalOpen] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Build query string from params
  const queryString = Object.entries(tableQueryParams || {})
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  // Fetch tasks data
  const {
    data: tasksData,
    isLoading,
    mutate: refreshTable,
    error,
    errorStates,
  } = useGetRequest(
    `/v1/agents/tasks?page=${currentPage}&limit=${entriesPerPage}${
      queryString && `&${queryString}`
    }`,
    true,
    60000
  );

  const filterList = [
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
    return generateTaskEntries(tasksData);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : 
                  day === 2 || day === 22 ? 'nd' : 
                  day === 3 || day === 23 ? 'rd' : 'th';
    return `${day}${suffix} ${month} ${year}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const paginationInfo = () => ({
    total: tasksData?.total || 0,
    currentPage,
    entriesPerPage,
    setCurrentPage,
    setEntriesPerPage
  });

  return (
    <>
      {!error ? (
        <div className="w-full">
          <Table
            tableType="default"
            tableTitle="Task History"
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
                  return <span className="text-sm text-gray-700">{String(index + 1).padStart(2, '0')}</span>;
                },
              },
              {
                title: "DATE",
                key: "datetime",
                customValue: (value) => {
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        {formatDate(value)} {formatTime(value)}
                      </span>
                      <img src={clockIcon} alt="clock" className="w-4 h-4" />
                    </div>
                  );
                },
              },
              {
                title: "CUSTOMER",
                key: "customerName",
                customValue: (value) => (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{value}</span>
                    <img src={smile} alt="smile" className="w-4 h-4" />
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
                title: "WAREHOUSE",
                key: "warehouse",
                customValue: (value) => (
                  <span className="text-sm text-gray-700">{value}</span>
                ),
              },
              {
                title: "INSTALLATION ADDRESS",
                key: "installationAddress",
                customValue: (value) => (
                  <span className="text-sm text-gray-700">{value}</span>
                ),
              },
              {
                title: "STATUS",
                key: "status",
                customValue: (value) => {
                  const status = value?.toLowerCase();
                  let dotColor = "bg-gray-500";
                  let bgColor = "bg-gray-100";
                  let textColor = "text-gray-800";
                  
                  switch (status) {
                    case 'pending':
                      dotColor = "bg-yellow-500";
                      bgColor = "bg-yellow-100";
                      textColor = "text-yellow-800";
                      break;
                    case 'accepted':
                      dotColor = "bg-blue-500";
                      bgColor = "bg-blue-100";
                      textColor = "text-blue-800";
                      break;
                    case 'completed':
                      dotColor = "bg-green-500";
                      bgColor = "bg-green-100";
                      textColor = "text-green-800";
                      break;
                    case 'rejected':
                    case 'cancelled':
                      dotColor = "bg-red-500";
                      bgColor = "bg-red-100";
                      textColor = "text-red-800";
                      break;
                    default:
                      break;
                  }
                  
                  return (
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
                      <span className={`px-2 py-1 ${bgColor} ${textColor} rounded-full text-xs font-medium uppercase`}>
                        {value}
                      </span>
                    </div>
                  );
                },
              },
              {
                title: "ACTIONS",
                key: "actions",
                valueIsAComponent: true,
                customValue: (_value: any, rowData: { id: string }) => {
                  return (
                    <span
                      className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
                      onClick={() => {
                        setSelectedTaskId(rowData.id);
                        setIsTaskHistoryModalOpen(true);
                      }}
                    >
                      View
                    </span>
                  );
                },
              },
            ]}
            refreshTable={async () => {
              await refreshTable();
            }}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={paginationInfo}
            clearFilters={() => setTableQueryParams({})}
          />
          <TaskHistoryModal
            isOpen={isTaskHistoryModalOpen}
            onClose={() => {
              setIsTaskHistoryModalOpen(false);
              setSelectedTaskId(null);
            }}
            taskId={selectedTaskId}
          />
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch task history."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorStates}
        />
      )}
    </>
  );
};

export default TaskHistoryTable; 