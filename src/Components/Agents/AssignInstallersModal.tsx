import React, { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useApiCall, useGetRequest } from "../../utils/useApiCall";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import rootStore from "../../stores/rootStore";

interface AssignInstallersModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentID: string;
  onSuccess?: () => void;
}

const AssignInstallersModal: React.FC<AssignInstallersModalProps> = ({
  isOpen,
  onClose,
  agentID,
  onSuccess
}) => {
  const [selectedInstallers, setSelectedInstallers] = useState<string[]>([]);

  const { agentAssignmentStore } = rootStore;
  const { apiCall } = useApiCall();

  // Fetch installers data
  const {
    data: installersData,
    isLoading,
    error,
    errorStates,
    mutate: refreshInstallers
  } = useGetRequest(
    `/v1/agents?category=INSTALLER`,
    isOpen,
    60000
  );
console.log(installersData)
  const handleInstallerSelect = (installerId: string) => {
    setSelectedInstallers(prev => 
      prev.includes(installerId) 
        ? prev.filter(id => id !== installerId)
        : [...prev, installerId]
    );
  };

  const handleSubmit = async () => {
    try {
      // Get the selected installer IDs
      const installerIds = selectedInstallers;

      // Call the API to assign installers
      await apiCall({
        endpoint: `/v1/agents/${agentID}/assign-agent-installer`,
        method: 'post',
        data: { installerIds },
        successMessage: 'Installers assigned successfully',
      });

      // Get the selected installer objects for store
      const selectedInstallerObjects = installersData?.agents?.filter((installer: any) => 
        selectedInstallers.includes(installer.id)
      ) || [];

      // Add installers to the store for UI updates
      agentAssignmentStore.addInstallers(agentID, selectedInstallerObjects);

      onSuccess?.();
      onClose();
      setSelectedInstallers([]);
    } catch (error) {
      console.error('Error assigning installers:', error);
    }
  };

  const isFormValid = selectedInstallers.length > 0;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        layout="right"
        bodyStyle="pb-44"
      >
        <div className="flex flex-col items-center bg-white">
          <div className="flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree bg-paleGrayGradientLeft">
            <h2 className="text-xl text-textBlack font-semibold font-secondary">
              Assign Installers to Agent
            </h2>
          </div>
          
          <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
            <DataStateWrapper
              isLoading={isLoading}
              error={error}
              errorStates={errorStates}
              refreshData={refreshInstallers}
              errorMessage="Failed to fetch installers"
            >
              <div className="w-full">
                <div className="mb-6">
                  <p className="text-sm text-textDarkGrey mb-2 font-medium">
                    Select installers to assign to this agent:
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#A58730] rounded-full"></div>
                    <p className="text-xs text-textGrey">
                      {selectedInstallers.length} installer{selectedInstallers.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto border border-strokeGreyTwo rounded-lg bg-white shadow-sm">
                  {installersData?.agents?.map((agent: any) => (
                    <div
                      key={agent.id}
                      className={`flex items-center justify-between p-4 border-b border-strokeGreyTwo cursor-pointer transition-all duration-200 ${
                        selectedInstallers.includes(agent.id) 
                          ? 'bg-gradient-to-r from-[#FEF5DA] to-[#F8CB48]/20 border-l-4 border-l-[#A58730] shadow-sm' 
                          : 'hover:bg-gray-50 hover:shadow-sm'
                      }`}
                      onClick={() => handleInstallerSelect(agent.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          selectedInstallers.includes(agent.id)
                            ? 'bg-[#A58730] border-[#A58730] shadow-sm'
                            : 'border-strokeGreyTwo bg-white hover:border-[#A58730]/50'
                        }`}>
                          {selectedInstallers.includes(agent.id) && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className={`text-sm font-semibold ${
                            selectedInstallers.includes(agent.id) ? 'text-[#A58730]' : 'text-textBlack'
                          }`}>
                            {agent.user.firstname} {agent.user.lastname}
                          </p>
                          <p className="text-xs text-textGrey font-medium">
                            {agent.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-textDarkGrey">
                        {agent.user.location}
                      </div>
                    </div>
                  ))}
                  {(!installersData?.agents || installersData.agents.length === 0) && (
                    <div className="flex items-center justify-center p-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                            <path d="M20 7L10 17L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p className="text-sm text-textGrey font-medium">No installers available</p>
                        <p className="text-xs text-textGrey">Installers will appear here once they are created</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3.5 px-4 text-sm font-semibold text-textDarkGrey bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-200 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className={`flex-1 py-3.5 px-4 text-sm font-semibold rounded-2xl transition-all duration-200 ${
                      isFormValid 
                        ? 'bg-gradient-to-r from-[#982214] to-[#F8CB48] text-white hover:opacity-90 shadow-lg hover:shadow-xl' 
                        : 'bg-gray-100 text-textDarkGrey cursor-not-allowed shadow-sm'
                    }`}
                  >
                    Assign {selectedInstallers.length} Installer{selectedInstallers.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </DataStateWrapper>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssignInstallersModal; 