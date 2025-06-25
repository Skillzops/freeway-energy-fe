import { useState } from "react";
import { KeyedMutator } from "swr";
import { PaginationType, Table } from "../TableComponent/Table";
import { GoDotFill } from "react-icons/go";
import clock from "../../assets/table/clock.svg";
import CustomerModal from "./CustomerModal";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";

interface CustomerEntries {
  id: string;
  no: number;
  name: string;
  email: string;
  location: string;
  // product: string;
  status: string;
}

type Permission = {
  id: string;
  action: string;
  subject: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type Role = {
  id: string;
  role: string;
  active: boolean;
  permissionIds: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  permissions: Permission[];
};

type CustomerDetails = {
  id: string;
  type: string;
  createdBy: string;
  creatorId: string;
  agentId: string;
  userId: string;
};

export type CustomerType = {
  id: string;
  firstname: string;
  lastname: string;
  username: string | null;
  email: string;
  phone: string;
  location: string;
  addressType: string | null;
  staffId: string | null;
  longitude: string;
  latitude: string;
  emailVerified: boolean;
  isBlocked: boolean;
  status: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastLogin: string | null;
  customerDetails: CustomerDetails;
  role: Role;
};

// Helper function to map the API data to the desired format
const generateCustomerEntries = (data: any): CustomerEntries[] => {
  const entries: CustomerEntries[] = data?.customers.map(
    (item: CustomerType, index: number) => {
      return {
        id: item?.id,
        no: index + 1,
        name: `${item?.firstname} ${item?.lastname}`,
        email: item?.email,
        location: item?.location,
        // product: "N/A",
        status: item?.status,
      };
    }
  );
  return entries;
};

const CustomerTable = ({
  customerData,
  isLoading,
  refreshTable,
  error,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  customerData: any;
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
  const [customerID, setCustomerID] = useState<string>("");
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);

  const filterList = [
    {
      name: "Location",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          location: query,
        }));
      },
      isSearch: true,
    },
    // {
    //   name: "Product",
    //   items: ["Product One", "Product Two"],
    //   onClickLink: (index: number) => {
    //     console.log("INDEX:", index);
    //   },
    // },
    {
      name: "Status",
      items: ["Active", "Inactive", "Barred"],
      onClickLink: async (index: number) => {
        const data = ["Active", "Inactive", "Barred"].map((item) =>
          item.toLocaleLowerCase()
        );
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

  const columnList = [
    { title: "S/N", key: "no" },
    { title: "NAME", key: "name" },
    { title: "EMAIL", key: "email" },
    { title: "LOCATION", key: "location" },
    // {
    //   title: "PRODUCT",
    //   key: "product",
    //   rightIcon: (
    //     <svg
    //       width="16"
    //       height="16"
    //       viewBox="0 0 16 16"
    //       fill="none"
    //       xmlns="http://www.w3.org/2000/svg"
    //     >
    //       <path
    //         fillRule="evenodd"
    //         clipRule="evenodd"
    //         d="M8.00024 1.8335C7.17181 1.8335 6.50024 2.50507 6.50024 3.3335V3.50675C6.87162 3.50015 7.27913 3.50016 7.72633 3.50016H8.27415C8.72136 3.50016 9.12886 3.50015 9.50024 3.50675V3.3335C9.50024 2.50507 8.82867 1.8335 8.00024 1.8335ZM10.5002 3.55211V3.3335C10.5002 1.95278 9.38095 0.833496 8.00024 0.833496C6.61953 0.833496 5.50024 1.95278 5.50024 3.3335V3.55211C5.40509 3.56031 5.31314 3.56979 5.22429 3.58077C4.55098 3.66396 3.99589 3.83872 3.52436 4.23005C3.05284 4.62138 2.77877 5.13475 2.57292 5.7812C2.37343 6.40768 2.22243 7.2131 2.0326 8.22555L2.01881 8.29908C1.75095 9.72762 1.53985 10.8534 1.50111 11.741C1.46141 12.6507 1.59675 13.4042 2.10993 14.0225C2.62312 14.6409 3.33873 14.9127 4.24019 15.0414C5.11967 15.1669 6.26508 15.1668 7.71849 15.1668H8.28195C9.73538 15.1668 10.8808 15.1669 11.7603 15.0414C12.6618 14.9127 13.3774 14.6409 13.8905 14.0225C14.4037 13.4042 14.5391 12.6507 14.4994 11.741C14.4606 10.8534 14.2495 9.72763 13.9817 8.2991L13.9679 8.22558C13.7781 7.21311 13.627 6.40769 13.4276 5.7812C13.2217 5.13475 12.9476 4.62138 12.4761 4.23005C12.0046 3.83872 11.4495 3.66396 10.7762 3.58077C10.6873 3.56979 10.5954 3.56031 10.5002 3.55211ZM5.34691 4.57322C4.77655 4.64369 4.43207 4.77625 4.163 4.99956C3.89393 5.22287 3.70016 5.53702 3.52578 6.08462C3.34721 6.64542 3.20671 7.38992 3.0093 8.44277C2.73215 9.92089 2.53543 10.9766 2.50016 11.7846C2.4655 12.5787 2.59288 13.0386 2.87944 13.3839C3.16601 13.7292 3.5945 13.9391 4.38145 14.0514C5.18205 14.1656 6.25597 14.1668 7.75985 14.1668H8.24063C9.74451 14.1668 10.8184 14.1656 11.619 14.0514C12.406 13.9391 12.8345 13.7292 13.121 13.3839C13.4076 13.0386 13.535 12.5787 13.5003 11.7846C13.4651 10.9766 13.2683 9.92089 12.9912 8.44277C12.7938 7.38992 12.6533 6.64542 12.4747 6.08462C12.3003 5.53702 12.1066 5.22287 11.8375 4.99956C11.5684 4.77625 11.2239 4.64369 10.6536 4.57322C10.0695 4.50105 9.31183 4.50016 8.24063 4.50016H7.75985C6.68865 4.50016 5.93101 4.50105 5.34691 4.57322ZM6.82816 8.19326C6.67529 8.24685 6.50024 8.41395 6.50024 8.79798C6.50024 8.94103 6.59439 9.16172 6.83988 9.44558C7.0723 9.71432 7.37929 9.96964 7.65794 10.1741C7.80876 10.2847 7.88036 10.3358 7.93765 10.366C7.97391 10.3852 7.98395 10.3852 8.00024 10.3852C8.01654 10.3852 8.02658 10.3852 8.06284 10.366C8.12012 10.3358 8.19173 10.2848 8.34255 10.1741C8.62119 9.96964 8.92818 9.71433 9.1606 9.44558C9.40609 9.16173 9.50024 8.94104 9.50024 8.79798C9.50024 8.41395 9.3252 8.24684 9.17232 8.19325C9.00545 8.13476 8.6964 8.1534 8.34603 8.48887C8.15268 8.67401 7.84781 8.67401 7.65445 8.48887C7.30408 8.1534 6.99503 8.13476 6.82816 8.19326ZM8.00024 7.4897C7.52272 7.17533 6.98356 7.07911 6.49735 7.24956C5.87521 7.46765 5.50024 8.06653 5.50024 8.79798C5.50024 9.31121 5.79438 9.7654 6.08351 10.0997C6.3857 10.4491 6.75967 10.7553 7.06636 10.9803C7.0819 10.9917 7.09755 11.0033 7.11336 11.015C7.34754 11.1881 7.61405 11.3852 8.00024 11.3852C8.38644 11.3852 8.65294 11.1882 8.88712 11.015C8.90293 11.0033 8.91858 10.9917 8.93412 10.9803C9.24082 10.7553 9.61478 10.4491 9.91698 10.0997C10.2061 9.7654 10.5002 9.31121 10.5002 8.79798C10.5002 8.06652 10.1253 7.46765 9.50313 7.24956C9.01692 7.07911 8.47776 7.17533 8.00024 7.4897Z"
    //         fill="#828DA9"
    //       />
    //     </svg>
    //   ),
    // },
    {
      title: "STATUS",
      key: "status",
      valueIsAComponent: true,
      customValue: (value: any) => {
        let style: string = "";

        if (value === "active") {
          style = "text-success";
        } else if (value === "inactive") {
          style = "text-strokeCream";
        } else {
          style = "text-errorTwo";
        }

        return (
          <span
            className={`${style} flex items-center gap-0.5 w-max px-2 py-1 bg-[#F6F8FA] border-[0.4px] border-strokeGreyTwo rounded-full uppercase`}
          >
            <GoDotFill />
            {value}
          </span>
        );
      },
      rightIcon: <img src={clock} alt="clock icon" className="ml-auto" />,
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
              setCustomerID(rowData.id);
              setIsOpen(true);
            }}
          >
            View
          </span>
        );
      },
    },
  ];

  const getTableData = () => {
    return generateCustomerEntries(customerData);
  };

  return (
    <>
      {!error ? (
        <div className="w-full">
          <Table
            tableTitle="CUSTOMERS"
            filterList={filterList}
            columnList={columnList}
            loading={isLoading}
            tableData={getTableData()}
            refreshTable={async () => {
              await refreshTable();
            }}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={paginationInfo}
            clearFilters={() => setTableQueryParams({})}
          />
          {customerID && (
            <CustomerModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              customerID={customerID}
              refreshTable={refreshTable}
            />
          )}
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch customer list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default CustomerTable;
