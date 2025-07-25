import React, { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
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

  // Mock data for installers
  const mockInstallersData = [
    {
      id: "1",
      firstname: "Naomi",
      lastname: "Gambo",
      email: "naomi.gambo@example.com",
      location: "Kaduna",
      installations: 1
    },
    {
      id: "2", 
      firstname: "Elizabeth",
      lastname: "Anigbogu",
      email: "elizabeth.anigbogu@example.com",
      location: "Kaduna",
      installations: 5
    },
    {
      id: "3",
      firstname: "Stephen",
      lastname: "Akinyemi", 
      email: "stephen.akinyemi@example.com",
      location: "Kaduna",
      installations: 3
    },
    {
      id: "4",
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      location: "Lagos",
      installations: 2
    },
    {
      id: "5",
      firstname: "Jane",
      lastname: "Smith",
      email: "jane.smith@example.com",
      location: "Abuja",
      installations: 4
    }
  ];

  const handleInstallerSelect = (installerId: string) => {
    setSelectedInstallers(prev => 
      prev.includes(installerId) 
        ? prev.filter(id => id !== installerId)
        : [...prev, installerId]
    );
  };

  const handleSubmit = async () => {
    try {
      // Get the selected installer objects
      const selectedInstallerObjects = mockInstallersData.filter(installer => 
        selectedInstallers.includes(installer.id)
      );

      // Add installers to the store
      agentAssignmentStore.addInstallers(agentID, selectedInstallerObjects);

      console.log('Assigned installers:', selectedInstallerObjects, 'to agent:', agentID);

      onSuccess?.();
      onClose();
      setSelectedInstallers([]);
    } catch (error) {
      console.error('Error assigning installers:', error);
    }
  };

  const isFormValid = selectedInstallers.length > 0;

  return (
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
              {mockInstallersData.map((installer) => (
                <div
                  key={installer.id}
                  className={`flex items-center justify-between p-4 border-b border-strokeGreyTwo cursor-pointer transition-all duration-200 ${
                    selectedInstallers.includes(installer.id) 
                      ? 'bg-gradient-to-r from-[#FEF5DA] to-[#F8CB48]/20 border-l-4 border-l-[#A58730] shadow-sm' 
                      : 'hover:bg-gray-50 hover:shadow-sm'
                  }`}
                  onClick={() => handleInstallerSelect(installer.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      selectedInstallers.includes(installer.id)
                        ? 'bg-[#A58730] border-[#A58730] shadow-sm'
                        : 'border-strokeGreyTwo bg-white hover:border-[#A58730]/50'
                    }`}>
                      {selectedInstallers.includes(installer.id) && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className={`text-sm font-semibold ${
                        selectedInstallers.includes(installer.id) ? 'text-[#A58730]' : 'text-textBlack'
                      }`}>
                        {installer.firstname} {installer.lastname}
                      </p>
                      <p className="text-xs text-textGrey font-medium">
                        {installer.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-textDarkGrey">
                    {installer.location}
                  </div>
                </div>
              ))}
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
        </div>
      </div>
    </Modal>
  );
};

export default AssignInstallersModal; 