import { useState } from "react";
import { PaginationType, Table } from "../TableComponent/Table";
import { CardComponent } from "../CardComponents/CardComponent";
import AgentsModal from "./AgentsModal";
import { ApiErrorStatesType } from "../../utils/useApiCall";
import { KeyedMutator } from "swr";
import { ErrorComponent } from "@/Pages/ErrorPage";

type User = {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  location: string;
  addressType: null | string;
  staffId: null | string;
  longitude: null | number;
  latitude: null | number;
  emailVerified: boolean;
  isBlocked: boolean;
  status: "active" | string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  lastLogin: null | string;
};

type AgentType = {
  id: string;
  agentId: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  user: User;
};

interface AgentEntries {
  id: string;
  datetime: string;
  name: string;
  status: string;
  onGoingSales: number;
  inventoryInPossession: number;
  sales: number;
  registeredCustomers: number;
  email: string;
  phone: string;
}

const generateAgentEntries = (data: any): AgentEntries[] => {
  const entries: AgentEntries[] = data?.agents?.map((agent: AgentType) => {
    return {
      id: agent?.id,
      datetime: agent?.createdAt,
      name: `${agent?.user?.firstname} ${agent?.user?.lastname}`,
      status: agent?.user?.status,
      onGoingSales: 0,
      inventoryInPossession: 0,
      sales: 0,
      registeredCustomers: 0,
      email: agent?.user?.email,
      phone: agent?.user?.phone,
    };
  });
  return entries;
};

const AgentsTable = ({
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [agentId, setAgentId] = useState<string>("");
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);

  const filterList = [
    // {
    //   name: "Status",
    //   items: ["Active Agents", "Inactive Agents", "Barred Agents"],
    //   onClickLink: async (index: number) => {
    //     const data = ["Active", "Inactive", "Barred"].map((item) =>
    //       item.toLocaleLowerCase()
    //     );
    //     const query = data[index];
    //     setQueryValue(query);
    //     setIsSearchQuery(true);
    //     setTableQueryParams((prevParams) => ({
    //       ...prevParams,
    //       status: query,
    //     }));
    //   },
    // },
    {
      name: "Search",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          search: query,
        }));
      },
      isSearch: true,
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

  const dropDownList = {
    items: ["View Agent profile"],
    onClickLink: (index: number, cardData: any) => {
      switch (index) {
        case 0:
          setAgentId(cardData?.productId);
          setIsOpen(true);
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  const getTableData = () => {
    return generateAgentEntries(agentData);
  };

  return (
    <>
      {!error ? (
        <div className="w-full">
          <Table
            tableType="card"
            tableTitle="ALL AGENTS"
            tableClassname="flex flex-wrap items-center gap-4"
            tableData={getTableData()}
            loading={isLoading}
            filterList={filterList}
            cardComponent={(data) => {
              return data?.map((item: AgentEntries, index) => (
                <CardComponent
                  key={index}
                  variant="agent"
                  productId={item.id}
                  name={item.name}
                  status={item.status}
                  onGoingSales={item.onGoingSales}
                  inventoryInPossession={item.inventoryInPossession}
                  sales={item.sales}
                  registeredCustomers={item.registeredCustomers}
                  handleCallClick={() => {
                    if (item.email) {
                      const callURL = `tel:${item.email}`;
                      window.open(callURL, "_self");
                    }
                  }}
                  handleWhatsAppClick={() => {
                    if (item.phone) {
                      const whatsappURL = `https://wa.me/${item.phone}`;
                      window.open(whatsappURL, "_blank");
                    }
                  }}
                  dropDownList={dropDownList}
                />
              ));
            }}
            refreshTable={async () => {
              await refreshTable();
            }}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={paginationInfo}
            clearFilters={() => setTableQueryParams({})}
          />
          {agentId && (
            <AgentsModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              agentID={agentId}
              refreshTable={refreshTable}
            />
          )}
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch agent list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default AgentsTable;
