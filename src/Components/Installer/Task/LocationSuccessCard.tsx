import React from 'react';
import curvedlines from "@/assets/sales/curvedlines.png";
import successIcon from "@/assets/success.svg";
import SecondaryButton from '@/Components/SecondaryButton/SecondaryButton';

interface LocationSuccessCardProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnHome: () => void;
  onRequestToken: () => void;
}

const LocationSuccessCard: React.FC<LocationSuccessCardProps> = ({
  isOpen,
  onClose,
  onReturnHome,
  onRequestToken
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-[20px] w-[90vw] max-w-[450px] p-6"
        style={{
          backgroundImage: `url(${curvedlines})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="flex flex-col justify-between h-full min-h-[600px] gap-2">
          <div className="flex flex-col items-center justify-center text-center space-y-3 flex-1 -mt-8">
            {/* Success Icon */}
            <div className="flex items-center justify-center">
              <img src={successIcon} alt="Success" className="w-50 h-50" />
            </div>

            {/* Success Text */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-textBlack">Successful</h2>
              <p className="text-textGrey">Address successfully Updated</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 w-full">
            <SecondaryButton
              variant="secondary"
              children="Return Home"
              onClick={onReturnHome}
            />
            <SecondaryButton
              children="Request Token"
              onClick={onRequestToken}
              className="bg-gradient-to-r from-orange-600 to-orange-400 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSuccessCard; 