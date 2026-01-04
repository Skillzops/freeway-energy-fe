import React from 'react';

interface AcceptTaskButtonProps {
  onClick: () => void;
  disabled?: boolean;
  text?: string;
}

const AcceptTaskButton: React.FC<AcceptTaskButtonProps> = ({ onClick, disabled = false, text = "Accept Task" }) => {
  return (
    <button 
      className="w-32 py-2.5 px-4 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default AcceptTaskButton; 
