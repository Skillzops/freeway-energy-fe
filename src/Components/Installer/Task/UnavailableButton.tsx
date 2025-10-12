import React from 'react';

interface UnavailableButtonProps {
  disabled?: boolean;
}

const UnavailableButton: React.FC<UnavailableButtonProps> = ({ disabled = true }) => {
  return (
    <button 
      className="flex-1 py-3 px-4 rounded-full bg-white border border-gray-300 text-textBlack font-medium opacity-50 cursor-not-allowed"
      disabled={disabled}
    >
      Unavailable
    </button>
  );
};

export default UnavailableButton; 