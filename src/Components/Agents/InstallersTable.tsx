import { useMemo, useState } from "react";
import { PaginationType, Table } from "../TableComponent/Table";
import { CardComponent } from "../CardComponents/CardComponent";
import InstallerModal from "./InstallerModal";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { KeyedMutator } from "swr";
import { ErrorComponent } from "@/Pages/ErrorPage";

type FlatInstaller = {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  location?: string;
  longitude?: string | number | null;
  latitude?: string | number | null;
  status?: string;
};

interface InstallerEntries {
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

/**
 * Extract installers from server shape:
 * {
 *   installers: [ { id, firstname, lastname, email, ... } ],
 *   total, page, limit, totalPages
 * }
 */
const selectRawInstallerList = (payload: any): FlatInstaller[] => {
  if (!payload) return [];
  if (Array.isArray(payload.installers)) return payload.installers as FlatInstaller[];
  return [];
};

const generateInstallerEntries = (payload: any): InstallerEntries[] => {
  const list = selectRawInstallerList(payload);

  return list.map((installer: FlatInstaller) => {
    const first = installer?.firstname ?? "";
    const last = installer?.lastname ?? "";
    const name = `${first} ${last}`.trim() || "Unnamed Installer";

    return {
      id: installer.id, // ✅ now directly from payload
      datetime: "", // not provided in new payload
      name,
      status: installer?.status ?? "active",
      onGoingSales: 0,
      inventoryInPossession: 0,
      sales: 0,
      registeredCustomers: 0,
      email: installer?.email ?? "",
      phone: installer?.phone ?? "",
    };
  });
};

const InstallersTable = ({
  installerData,
  isLoading,
  refreshTable,
  error,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  installerData: any; // { installers: [] }
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  error: any;
  errorData: ApiErrorStatesType;
  paginationInfo: PaginationType;
  setTableQueryParams: React.Dispatch<React.SetStateAction<Record<string, any> | null>>;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [installerId, setInstallerId] = useState<string>("");
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);

  const entries = useMemo(() => generateInstallerEntries(installerData), [installerData]);

  const filterList = [
    {
      name: "Search",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prev) => ({
          ...(prev || {}),
          search: query,
        }));
      },
      isSearch: true,
    },
    {
      onDateClick: (date: string) => {
        setQueryValue(date);
        setIsSearchQuery(false);
        setTableQueryParams((prev) => ({
          ...(prev || {}),
          createdAt: date.split("T")[0],
        }));
      },
      isDate: true,
    },
  ];

  const dropDownList = {
    items: ["View Installer profile"],
    onClickLink: (index: number, cardData: any) => {
      switch (index) {
        case 0:
          setInstallerId(cardData?.productId);
          setIsOpen(true);
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  return (
    <>
      {!error ? (
        <div className="w-full">
          <Table
            tableType="card"
            tableTitle="ALL INSTALLERS"
            tableClassname="flex flex-wrap items-center gap-4"
            tableData={entries} // ✅ flat installers list
            loading={isLoading}
            filterList={filterList}
            cardComponent={(data) =>
              data?.map((item: InstallerEntries, index: number) => (
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
                    if (item.phone) {
                      const callURL = `tel:${item.phone}`;
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
              ))
            }
            refreshTable={async () => {
              await refreshTable();
            }}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={paginationInfo}
            clearFilters={() => setTableQueryParams({})}
          />
          {installerId && (
            <InstallerModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              installerID={installerId}
              refreshTable={refreshTable}
            />
          )}
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch installer list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default InstallersTable;
