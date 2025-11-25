import { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { DropDown } from "../DropDownComponent/DropDown";
import TabComponent from "../TabComponent/TabComponent";
import { useGetRequest } from "@/utils/useApiCall";
import { KeyedMutator } from "swr";
import InstallerDetails, { InstallerUserType } from "./InstallerDetails";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";

const InstallerModal = ({
  isOpen,
  setIsOpen,
  installerID,
  refreshTable,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  installerID: string;
  refreshTable: KeyedMutator<any>;
}) => {
  const [tabContent, setTabContent] = useState<string>("installerDetails");

  // NOTE: keeping AGENTS API as requested
  const fetchSingleInstaller = useGetRequest(
    `/v1/agents/installers/${installerID}`,
    false
  );
  

  const generateInstallerEntries = (data: any): InstallerUserType => {
    return {
      id: data?.installer?.id,
      firstname: data?.installer?.user?.firstname,
      lastname: data?.installer?.user?.lastname,
      email: data?.installer?.user?.email,
      phone: data?.installer?.user?.phone,
      location: data?.installer?.user?.location,
      longitude: data?.installer?.user?.longitude,
      latitude: data?.installer?.user?.latitude,
      addressType: data?.installer?.user?.addressType,
      status: data?.installer?.user?.status,
      emailVerified: data?.installer?.user?.emailVerified,
    };
  };

  const dropDownList = {
    items: ["Cancel Installer"],
    onClickLink: (index: number) => {
      switch (index) {
        case 1:
          console.log("Cancel Installer");
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  const tabNames = [
    { name: "Installer Details", key: "installerDetails", count: null },
    { name: "Customer", key: "customer", count: 0 },
    { name: "Inventory", key: "inventory", count: 0 },
    { name: "Transactions", key: "transactions", count: 0 },
    { name: "Stats", key: "stats", count: 0 },
    { name: "Sales", key: "sales", count: 0 },
    { name: "Tickets", key: "tickets", count: 0 },
  ];

  return (
    <Modal
      layout="right"
      size="large"
      bodyStyle="pb-44 overflow-auto"
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setTabContent("installerDetails");
      }}
    >
      <div className="bg-white">
        <header
          className={`flex items-center ${
            fetchSingleInstaller?.data?.user?.firstname
              ? "justify-between"
              : "justify-end"
          } bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree`}
        >
          {fetchSingleInstaller?.data?.user?.firstname ? (
            <p className="flex items-center justify-center bg-paleLightBlue w-max p-2 h-[24px] text-textBlack text-xs font-semibold rounded-full">
              {fetchSingleInstaller?.data?.user?.firstname}{" "}
              {fetchSingleInstaller?.data?.user?.lastname}
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

          {tabContent === "installerDetails" ? (
            <DataStateWrapper
              isLoading={fetchSingleInstaller?.isLoading}
              error={fetchSingleInstaller?.error}
              errorStates={fetchSingleInstaller?.errorStates}
              refreshData={fetchSingleInstaller?.mutate}
              errorMessage="Failed to fetch installer details"
            >
              <InstallerDetails
                {...generateInstallerEntries(fetchSingleInstaller.data)}
                refreshTable={refreshTable}
                displayInput={false}
              />
            </DataStateWrapper>
          ) : (
            <div>
              {tabNames?.find((item) => item.key === tabContent)?.name} Coming
              Soon
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default InstallerModal;
