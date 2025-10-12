import React, { useState, useEffect } from 'react';
import { z } from "zod";
import closeIcon from '@/assets/close.svg';
import curvedlines from "@/assets/sales/curvedlines.png";
import redcustomerbag from "@/assets/customers/redcustomerbag.svg";
import LocationSuccessCard from "./LocationSuccessCard";
import SecondaryButton from '@/Components/SecondaryButton/SecondaryButton';

// Zod Schema for location validation
const locationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationUpdateCardProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateLocation: (address: string, coordinates?: { lat: string; lng: string }) => void;
}

const LocationUpdateCard: React.FC<LocationUpdateCardProps> = ({
  isOpen,
  onClose,
  onUpdateLocation
}) => {
  const [formData, setFormData] = useState<LocationFormData>({
    address: '',
    latitude: '',
    longitude: ''
  });
  const [errors, setErrors] = useState<Partial<LocationFormData>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Google Places Autocomplete
  useEffect(() => {
    if (!isOpen) return; // Only initialize when modal is open

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_API_KEY || "AIzaSyDqKiQNSG3P4Wsx3Qjy_BSQO2fTgfZIZoE"}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Wait a bit for the DOM to be ready
      setTimeout(() => {
        const input = document.getElementById('google-address-input') as HTMLInputElement;
        if (input && window.google) {
          const autocomplete = new window.google.maps.places.Autocomplete(input, {
            types: ['geocode'],
            componentRestrictions: { country: 'ng' },
            fields: ['geometry', 'formatted_address', 'name']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
              const fullAddress = place.formatted_address || place.name || '';
              const coordinates = {
                lat: place.geometry.location.lat().toString(),
                lng: place.geometry.location.lng().toString(),
              };

              setFormData(prev => ({
                ...prev,
                address: fullAddress,
                latitude: coordinates.lat,
                longitude: coordinates.lng
              }));
            }
          });
        }
      }, 100);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [isOpen]); // Re-run when modal opens/closes

  const handleDone = () => {
    try {
      const validatedData = locationSchema.parse(formData);
      onUpdateLocation(validatedData.address, { lat: validatedData.latitude, lng: validatedData.longitude });
      setShowSuccess(true);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<LocationFormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LocationFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleReturnHome = () => {
    setShowSuccess(false);
    onClose();
  };

  const handleRequestToken = () => {
    setShowSuccess(false);
    onClose();
    // TODO: Navigate to request token page or open token modal
    console.log('Request token clicked');
  };

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
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors"
              >
                <img src={closeIcon} alt="Close" className="w-4 h-4" />
              </button>
            </div>

            {/* Shopping Bag Icon */}
            <div className="flex justify-start pl-4 mb-6">
              <img src={redcustomerbag} alt="Shopping Bag" className="w-20 h-20" />
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-100 rounded-lg p-4 mb-6">
                <p className="text-textBlack text-sm italic">
                  Try inputting the address of the installation site, or click the location icon to automatically generate the live google address.
                </p>
              </div>

              {/* Google Address Input */}
              <div className="space-y-4">
                <div className="w-full">
                  <div className="relative autofill-parent flex items-center w-full px-[1.1em] py-[1.25em] gap-1 rounded-3xl h-[48px] border-[0.6px] border-strokeGrey transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
                    <span className="absolute flex -top-2 items-center justify-center text-sm text-textGrey font-semibold px-2 py-0.5 max-w-max h-4 bg-white border-[0.6px] border-strokeCream rounded-[200px] transition-opacity duration-500 ease-in-out opacity-100">
                      GOOGLE ADDRESS
                    </span>
                    <input
                      id="google-address-input"
                      type="text"
                      placeholder="Enter installation address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full text-sm font-semibold text-textBlack placeholder:text-textGrey placeholder:font-normal placeholder:italic"
                    />
                  </div>
                </div>

                {/* Longitude Input */}
                <div className="w-full">
                  <div className="relative autofill-parent flex items-center w-full px-[1.1em] py-[1.25em] gap-1 rounded-3xl h-[48px] border-[0.6px] border-strokeGrey transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
                    <span className="absolute flex -top-2 items-center justify-center text-sm text-textGrey font-semibold px-2 py-0.5 max-w-max h-4 bg-white border-[0.6px] border-strokeCream rounded-[200px] transition-opacity duration-500 ease-in-out opacity-100">
                      LONGITUDE
                    </span>
                    <input
                      type="text"
                      placeholder="44556677"
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                      className="w-full text-sm font-semibold text-textBlack placeholder:text-textGrey placeholder:font-normal placeholder:italic"
                    />
                  </div>
                </div>

                {/* Latitude Input */}
                <div className="w-full">
                  <div className="relative autofill-parent flex items-center w-full px-[1.1em] py-[1.25em] gap-1 rounded-3xl h-[48px] border-[0.6px] border-strokeGrey transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
                    <span className="absolute flex -top-2 items-center justify-center text-sm text-textGrey font-semibold px-2 py-0.5 max-w-max h-4 bg-white border-[0.6px] border-strokeCream rounded-[200px] transition-opacity duration-500 ease-in-out opacity-100">
                      LATITUDE
                    </span>
                    <input
                      type="text"
                      placeholder="112233445"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                      className="w-full text-sm font-semibold text-textBlack placeholder:text-textGrey placeholder:font-normal placeholder:italic"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1">
            <SecondaryButton
              variant="secondary"
              children="Cancel"
              onClick={onClose}
            />
            <SecondaryButton
              disabled={!formData.address.trim() || !formData.latitude.trim() || !formData.longitude.trim()}
              children="Done"
              onClick={handleDone}
              className="bg-gradient-to-r from-orange-400 to-orange-600 text-white"
            />
          </div>
        </div>
      </div>
      
      {/* Success Card - Show independently */}
      <LocationSuccessCard
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        onReturnHome={handleReturnHome}
        onRequestToken={handleRequestToken}
      />
    </div>
  );
};

export default LocationUpdateCard; 