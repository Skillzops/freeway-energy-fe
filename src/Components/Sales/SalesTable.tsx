import { useEffect, useMemo, useState } from "react";
import { ApiErrorStatesType, useGetRequest } from "@/utils/useApiCall";
import { KeyedMutator } from "swr";
import { PaginationType, Table } from "../TableComponent/Table";
import { ErrorComponent } from "@/Pages/ErrorPage";
import SalesDetailsModal from "./SalesDetailsModal";
import {
  NameTag,
  DateTimeTag,
  NairaSymbol,
  SimpleTag,
} from "../CardComponents/CardComponent";
import { formatNumberWithCommas } from "@/utils/helpers";

type SalesEntries = {
  no: any;
  saleId?: string;
  paymentMode: string;
  transactionDate: string;
  customer: string;
  status: string;
  amount: number;
  amountPaid: number;
  balance: number;
  creator?: string;
};

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

const generateSalesEntries = (data: any): SalesEntries[] => {
  const entries: SalesEntries[] =
    data?.saleItems?.map((item: any, index: number) => {
      const customerKey = item?.sale?.customer;
      const customerName = `${customerKey?.firstname || ""} ${customerKey?.lastname || ""}`.trim();

      const totalAmount = item?.sale?.totalPrice || 0;

      const creatorName = item?.sale?.creatorDetails
        ? `${item?.sale?.creatorDetails?.firstname || ""} ${
            item?.sale?.creatorDetails?.lastname || ""
          }`.trim()
        : "N/A";

      let paidAmount = 0;
      if (Array.isArray(item?.sale?.payment)) {
        paidAmount = item.sale.payment
          .filter((p: any) => p?.paymentStatus === "COMPLETED")
          .reduce((sum: number, p: any) => sum + (p?.amount || 0), 0);
      }

      return {
        no: index + 1,
        saleId: item?.id,
        paymentMode: item?.paymentMode === "ONE_OFF" ? "SINGLE DEPOSIT" : item?.paymentMode,
        transactionDate: item?.sale?.transactionDate || item?.createdAt,
        customer: customerName || "N/A",
        status: item?.sale?.status,
        amount: totalAmount,
        amountPaid: paidAmount,
        balance: totalAmount - paidAmount,
        creator: creatorName,
      };
    }) || [];

  return entries;
};

const SalesTable = ({
  salesData,
  isLoading,
  refreshTable,
  error,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  salesData: any;
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  error: any;
  errorData: ApiErrorStatesType;
  paginationInfo: PaginationType;
  setTableQueryParams: React.Dispatch<React.SetStateAction<Record<string, any> | null>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [salesID, setSalesID] = useState("");
  const [queryValue, setQueryValue] = useState("");
  const [isSearchQuery, setIsSearchQuery] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const buildFullName = (...parts: Array<string | undefined>) =>
    parts.filter(Boolean).join(" ").trim();

  // -------------------------
  // Customer API search (triggered by 🔍 in Table)
  // -------------------------
  const [customerKeyword, setCustomerKeyword] = useState("");
  const debouncedCustomerKeyword = useDebouncedValue(customerKeyword, 250);

  const customersSearchUrl = useMemo(() => {
    const q = (debouncedCustomerKeyword || "").trim();
    return `/v1/customers?limit=50&search=${encodeURIComponent(q)}`;
  }, [debouncedCustomerKeyword]);

  const { data: customersResponse, isLoading: customersLoading } = useGetRequest(customersSearchUrl, true, 60000);

  const customers = useMemo(() => {
    if (Array.isArray(customersResponse)) return customersResponse;
    if (Array.isArray(customersResponse?.customers)) return customersResponse.customers;
    if (Array.isArray(customersResponse?.customer)) return customersResponse.customer;
    if (Array.isArray(customersResponse?.data)) return customersResponse.data;
    return [];
  }, [customersResponse]);

  const customerOptions = useMemo(() => {
    const unique = new Map<string, string>();

    customers.forEach((c: any) => {
      const id = c?.id || "";
      if (!id) return;

      const name = buildFullName(c?.firstname, c?.lastname, c?.phone) || c?.customerName || c?.name || "";
      unique.set(id, name || id);
    });

    return Array.from(unique.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [customers]);

  // -------------------------
  // Agent API search (triggered by 🔍 in Table)
  // -------------------------
  const [agentKeyword, setAgentKeyword] = useState("");
  const debouncedAgentKeyword = useDebouncedValue(agentKeyword, 250);

  const agentsSearchUrl = useMemo(() => {
    const q = (debouncedAgentKeyword || "").trim();
    return `/v1/agents?category=SALES&limit=50&search=${encodeURIComponent(q)}`;
  }, [debouncedAgentKeyword]);

  const { data: agentsResponse, isLoading: agentsLoading } = useGetRequest(agentsSearchUrl, true, 60000);

  const agents = useMemo(() => {
    if (Array.isArray(agentsResponse)) return agentsResponse;
    if (Array.isArray(agentsResponse?.agents)) return agentsResponse.agents;
    if (Array.isArray(agentsResponse?.agent)) return agentsResponse.agent;
    if (Array.isArray(agentsResponse?.data)) return agentsResponse.data;
    return [];
  }, [agentsResponse]);

  const agentOptions = useMemo(() => {
    const unique = new Map<string, string>();

    agents.forEach((a: any) => {
    

      const agentUser = a?.user;

      const id = agentUser?.id;
      if (!id) return;

      const name = buildFullName(agentUser?.firstname, agentUser?.lastname,  agentUser?.phone) || agentUser?.name || "";

      unique.set(id, name || id);
    });

    return Array.from(unique.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [agents]);

  const handleClearFilters = () => {
    setTableQueryParams({});
    setQueryValue("");
    setIsSearchQuery(false);
    setSelectedCustomerId(null);
    setSelectedAgentId(null);
    setCustomerKeyword("");
    setAgentKeyword("");
  };

  const filterList: any[] = [
    {
      name: "Search",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prev) => ({ ...(prev || {}), search: query }));
      },
      isSearch: true,
    },
    {
      name:
        selectedCustomerId && customerOptions.length
          ? customerOptions.find((o) => o.id === selectedCustomerId)?.label || "Customer ID"
          : "Customer ID",
      items: customerOptions.map((o) => o.label),
      title: "Customers",
      searchable: true,
      searchPlaceholder: "Type then click 🔍",
      apiSearchMode: true,
      onDropdownSearch: (keyword: string) => {
        // keyword comes from Table when user clicks 🔍
        setCustomerKeyword(keyword);
      },
      onClickLink: async (index: number) => {
        const selected = customerOptions[index];
        if (!selected) return;

        setSelectedCustomerId(selected.id);
        setIsSearchQuery(false);
        setTableQueryParams((prev) => ({ ...(prev || {}), customerId: selected.id }));
      },
      searchMode: 'api',
      isLoading: customersLoading,
    },
    {
      name:
        selectedAgentId && agentOptions.length
          ? agentOptions.find((o) => o.id === selectedAgentId)?.label || "Agent ID"
          : "Agent ID",
      items: agentOptions.map((o) => o.label),
      title: "Sales Agents",
      searchable: true,
      searchPlaceholder: "Type then click 🔍",
      apiSearchMode: true,
      onDropdownSearch: (keyword: string) => {
        setAgentKeyword(keyword);
      },
      onClickLink: async (index: number) => {
        const selected = agentOptions[index];
        if (!selected) return;

        setSelectedAgentId(selected.id);
        setIsSearchQuery(false);
        setTableQueryParams((prev) => ({ ...(prev || {}), agentId: selected.id }));
      },
      searchMode: 'api',
      isLoading: agentsLoading,
    },
    {
      name: "Date",
      isDateRange: true,
      onDateClick: (startDate: string, endDate?: string) => {
        const end = endDate || startDate;
        setQueryValue(endDate ? `${startDate} - ${end}` : startDate);
        setIsSearchQuery(false);

        setTableQueryParams((prev) => {
          const next = { ...(prev || {}) };
          next.startDate = startDate;
          next.endDate = end;

          if (startDate === end) next.createdAt = startDate;
          else delete (next as any).createdAt;

          return next;
        });
      },
      isDate: true,
    },
  ];

  const columnList: any[] = [
    { title: "S/N", key: "no" },
    {
      title: "CUSTOMER",
      key: "customer",
      valueIsAComponent: true,
      customValue: (value: string) => <NameTag name={value} />,
    },
    {
      title: "CREATOR",
      key: "creator",
      valueIsAComponent: true,
      customValue: (value: string) => <NameTag name={value} />,
    },
    {
      title: "DATE CREATED",
      key: "transactionDate",
      valueIsAComponent: true,
      customValue: (value: string) => <DateTimeTag datetime={value} showAll={false} />,
    },
    {
      title: "STATUS",
      key: "status",
      valueIsAComponent: true,
      customValue: (value: string) => (
        <SimpleTag
          text={value}
          dotColour="#9BA4BA"
          containerClass="bg-[#F6F8FA] font-light text-textDarkGrey px-2 py-1 border-[0.4px] border-strokeGreyThree rounded-full"
        />
      ),
    },
    { title: "PAYMENT MODE", key: "paymentMode" },
    {
      title: "TOTAL AMOUNT",
      key: "amount",
      valueIsAComponent: true,
      customValue: (value: number) => (
        <div className="flex items-center gap-1">
          <NairaSymbol />
          <span className="text-textBlack">
            {value !== undefined && value !== null ? formatNumberWithCommas(value) : "0"}
          </span>
        </div>
      ),
    },
    {
      title: "AMOUNT PAID",
      key: "amountPaid",
      valueIsAComponent: true,
      customValue: (value: number) => (
        <div className="flex items-center gap-1">
          <NairaSymbol />
          <span className="text-textBlack">
            {value !== undefined && value !== null ? formatNumberWithCommas(value) : "0"}
          </span>
        </div>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      valueIsAComponent: true,
      customValue: (_: any, rowData: { saleId: string }) => (
        <span
          className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
          onClick={() => {
            setSalesID(rowData.saleId);
            setIsOpen(true);
          }}
        >
          View
        </span>
      ),
    },
  ];

  const tableData = useMemo(() => generateSalesEntries(salesData), [salesData]);

  return (
    <>
      {!error ? (
        <div className="w-full">
          <Table
            tableTitle="SALES"
            filterList={filterList}
            columnList={columnList}
            loading={isLoading}
            tableData={tableData}
            refreshTable={async () => refreshTable(undefined, { revalidate: true })}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={paginationInfo}
            clearFilters={handleClearFilters}
          />

          {salesID && (
            <SalesDetailsModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              salesID={salesID}
              refreshTable={refreshTable}
            />
          )}
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch sales list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default SalesTable;
