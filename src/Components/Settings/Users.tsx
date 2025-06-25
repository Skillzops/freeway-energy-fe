import { useState } from "react";
import { PaginationType, Table } from "../TableComponent/Table";
import role from "../../assets/table/role.svg";
import clock from "../../assets/table/clock.svg";
import { GoDotFill } from "react-icons/go";
import { ApiErrorStatesType } from "../../utils/useApiCall";
import UserModal from "./UserModal";
import { capitalizeFirstLetter } from "../../utils/helpers";
import { KeyedMutator } from "swr";
import { ErrorComponent } from "@/Pages/ErrorPage";

interface UserEntries {
  id: string;
  no: number;
  name: string;
  email: string;
  location: string | null;
  role: string;
  status: string;
}

// Helper function to map the API data to the desired format
const generateUserEntries = (data: any): UserEntries[] => {
  const entries: UserEntries[] = data?.users?.map(
    (user: any, index: number) => {
      return {
        id: user?.id,
        no: index + 1,
        name: `${user?.firstname} ${user?.lastname}`,
        email: user?.email,
        location: user?.location || "N/A",
        role: user?.role?.role?.toUpperCase(),
        status: user?.status?.toUpperCase(),
      };
    }
  );

  return entries;
};

const Users = ({
  rolesList,
  data,
  isLoading,
  refreshTable,
  error,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  rolesList: any;
  data: any;
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
  const [userID, setUserID] = useState<string>("");
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);

  const filterList = [
    {
      name: "Roles",
      items: [
        "All Roles",
        ...(rolesList
          ? rolesList.map((role: any) => capitalizeFirstLetter(role.label))
          : []),
      ],
      onClickLink: async (index: number) => {
        setIsSearchQuery(false);
        let roleId = "";
        if (index !== 0) {
          const selectedRole = rolesList[index - 1];
          roleId = selectedRole?.value;
          setQueryValue(roleId);
        } else {
          setQueryValue("");
        }
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          roleId: roleId,
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
  ];

  const columnList = [
    { title: "S/N", key: "no" },
    { title: "NAME", key: "name" },
    { title: "EMAIL", key: "email" },
    { title: "LOCATION", key: "location" },
    {
      title: "ROLE",
      key: "role",
      valueIsAComponent: true,
      customValue: (value: any) => {
        return (
          <span className="flex items-center gap-0.5 w-max px-2 py-1 bg-[#F6F8FA] border-[0.4px] border-strokeGreyTwo rounded-full">
            <GoDotFill />
            {value}
          </span>
        );
      },
      rightIcon: <img src={role} alt="role icon" className="ml-auto" />,
    },
    {
      title: "STATUS",
      key: "status",
      valueIsAComponent: true,
      customValue: (value: any) => {
        let style: string = "";

        if (value === "ACTIVE") {
          style = "text-success";
        } else {
          style = "text-errorTwo";
        }

        return (
          <span
            className={`${style} flex items-center gap-0.5 w-max px-2 py-1 bg-[#F6F8FA] border-[0.4px] border-strokeGreyTwo rounded-full`}
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
      customValue: (_: any, rowData: any) => {
        return (
          <span
            className="px-2 py-1 text-[10px] text-textBlack font-medium bg-[#F6F8FA] border-[0.2px] border-strokeGreyTwo rounded-full shadow-innerCustom cursor-pointer transition-all hover:bg-gold"
            onClick={() => {
              setUserID(rowData.id);
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
    return generateUserEntries(data);
  };
  return (
    <>
      {!error ? (
        <div className="w-full">
          <Table
            tableTitle="USERS"
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
          <UserModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            userID={userID}
            refreshTable={refreshTable}
            rolesList={rolesList}
          />
        </div>
      ) : (
        <ErrorComponent
          message={
            errorData.isPermissionError
              ? "You dont't have permission to view users"
              : "Failed to fetch user list."
          }
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default Users;

// Ability to do nested query searches. Add later
