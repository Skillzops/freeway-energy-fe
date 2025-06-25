import { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { DropDown } from "../DropDownComponent/DropDown";
import TabComponent from "../TabComponent/TabComponent";
import { useGetRequest } from "../../utils/useApiCall";
import { KeyedMutator } from "swr";
// import editInput from "../../assets/settings/editInput.svg";
import AgentDetails, { AgentUserType } from "./AgentDetails";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";

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

  const fetchSingleAgent = useGetRequest(`/v1/agents/${agentID}`, false);

  const generateAgentEntries = (data: any): AgentUserType => {
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
    };
  };

  // const handleCancelClick = () => setDisplayInput(false);

  const dropDownList = {
    items: ["Cancel Agent"],
    onClickLink: (index: number) => {
      switch (index) {
        // case 0:
        //   setDisplayInput(true);
        //   break;
        case 1:
          console.log("Cancel Agent");
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
        setTabContent("agentDetails");
        // setDisplayInput(false)
      }}
      // rightHeaderComponents={
      //   displayInput ? (
      //     <p
      //       className="text-xs text-textDarkGrey font-semibold cursor-pointer over"
      //       onClick={handleCancelClick}
      //       title="Cancel editing agent details"
      //     >
      //       Cancel Edit
      //     </p>
      //   ) : (
      //     <button
      //       className="flex items-center justify-center w-[24px] h-[24px] bg-white border border-strokeGreyTwo rounded-full hover:bg-slate-100"
      //       onClick={() => setDisplayInput(true)}
      //     >
      //       <img src={editInput} alt="Edit Button" width="15px" />
      //     </button>
      //   )
      // }
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

export default AgentModal;
