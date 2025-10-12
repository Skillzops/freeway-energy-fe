import React from 'react';
import { FaRegUser } from "react-icons/fa";
import UnavailableButton from './UnavailableButton';

interface TaskCardProps {
  dateAssigned: string;
  taskValidity: string;
  requestingAgent: string;
  pickupLocation: string;
  productType: string[];
  deviceId: string;
  tokenStatus: string;
  onViewTask?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  dateAssigned,
  taskValidity,
  requestingAgent,
  pickupLocation,
  productType,
  deviceId,
  tokenStatus,
  onViewTask
}) => {
  const Field = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="flex justify-between items-center w-full">
      <div className="bg-[#F8F9FB] px-3 py-1.5 rounded-full">
        <span className="text-textDarkBrown text-xs font-medium">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-textBlack text-xs font-medium">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Date and Validity Section */}
      <div className="flex flex-col p-3 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <Field 
          label="Date Assigned" 
          value={dateAssigned}
        />
        <Field 
          label="Task Validity" 
          value={taskValidity}
        />
      </div>

      {/* Details Section */}
      <div className="flex flex-col p-3 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <Field 
          label="Requesting Agent" 
          value={
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#F8F9FB] rounded-full flex items-center justify-center">
                <FaRegUser className="w-2.5 h-2.5 text-textDarkBrown" />
              </div>
              <span className="bg-[#F8F9FB] px-2.5 py-1 rounded-full text-textBlack text-xs">
                {requestingAgent}
              </span>
            </div>
          } 
        />
        <Field 
          label="Pickup Location" 
          value={pickupLocation}
        />
        <Field 
          label="Product Type" 
          value={
            <div className="flex gap-2">
              {productType.map((type, index) => (
                <span 
                  key={index}
                  className="bg-purpleBlue px-2.5 py-1 rounded-full text-xs font-medium text-textBlack"
                >
                  {type}
                </span>
              ))}
            </div>
          } 
        />
        <Field 
          label="Device ID" 
          value={deviceId}
        />
        <Field 
          label="Token Status" 
          value={tokenStatus}
        />

        {/* Action Buttons */}
        <div className="flex gap-2 mt-2">
          <UnavailableButton />
          <button 
            onClick={onViewTask}
            className="flex-1 py-2.5 px-4 rounded-full bg-primaryGradient text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            View Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard; 