import React from 'react';

interface RejectTaskButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const RejectTaskButton: React.FC<RejectTaskButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button 
      className="w-32 py-2.5 px-4 rounded-full bg-white border border-strokeGreyThree text-textDarkBrown text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      onClick={onClick}
      disabled={disabled}
    >
      Reject Task
    </button>
  );
};

export default RejectTaskButton; 