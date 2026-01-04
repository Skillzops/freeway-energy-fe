import React from 'react';
// import notification from "@/assets/dashboard/notification.svg";
import { FiClipboard } from 'react-icons/fi';

interface TaskHeaderProps {
  count: number;
  onPrevious: () => void;
  onNext: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ count, onPrevious, onNext }) => {
  return (
    <div className="flex items-center justify-between w-full px-4 py-2 border-b border-strokeGreyThree">
      {/* Left side: Icon, Title and Count */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* Task Icon with background */}
          {/* <div className="w-12 h-12 bg-[#FDEEC2] rounded-full flex items-center justify-center">
            <img src={notification} alt="New Task" className="w-6 h-6" />
          </div> */}

          <div
            className="relative w-10 h-10 grid place-items-center rounded-xl shadow-lg ring-1 ring-white/20 bg-primaryGradient"
          >
            <FiClipboard className="w-5 h-5 text-white drop-shadow-sm" />
            <span
              className="pointer-events-none absolute inset-0 blur-md opacity-50 -z-10"
              style={{ backgroundImage: "var(--brand-gradient-primary)" }}
            />
          </div>

          {/* Count Badge */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">{count}</span>
          </div>
        </div>
        <span className="text-sm font-bold text-primary">New Tasks</span>
      </div>

      {/* Right side: Navigation Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onPrevious}
          className="w-10 h-10 rounded-full border border-[#E0E0E0] flex items-center justify-center hover:bg-accent-20 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#828DA9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={onNext}
          className="w-10 h-10 rounded-full border border-[#E0E0E0] flex items-center justify-center hover:bg-[#FEF5DA] transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 6L15 12L9 18" stroke="#828DA9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TaskHeader; 
