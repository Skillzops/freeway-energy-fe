import { useCallback, useEffect, useRef, useState } from "react";
import { Input, InputType } from "./Input";

declare global {
  interface Window {
    google: any;
    __googleMapsScriptId?: string;
  }
}

export type PlaceResult = {
  geometry?: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  formatted_address?: string;
  name: string;
};

type GooglePlacesInputProps = Omit<InputType, "onChange"> & {
  onChange: (
    value: string,
    place?: PlaceResult,
    coordinates?: { lat: string | null; lng: string | null }
  ) => void;
  value: string;
};

export const GooglePlacesInput = ({
  onChange,
  value,
  ...props
}: GooglePlacesInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [internalValue, setInternalValue] = useState(value || "");
  const [apiLoaded, setApiLoaded] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || "AIzaSyATl5m6TnXjJ2R3c-Qpr8ccx_DrJia3Gd0";

  // Sync internal value with external value changes
  useEffect(() => {
    setInternalValue(value || "");
  }, [value]);

  // Add CSS to fix dropdown positioning
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .pac-container {
        z-index: 10000 !important;
        margin-top: 5px !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
        max-height: 250px !important;
        overflow-y: auto !important;
      }
      .pac-item {
        padding: 8px 12px !important;
        cursor: pointer !important;
      }
      .pac-item:hover {
        background-color: #f5f5f5 !important;
      }
      .pac-item-query {
        font-size: 14px !important;
      }
      .pac-matched {
        font-weight: bold !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange(newValue);
  };

  const initializeAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) {
      console.error("Google Maps JavaScript API not loaded properly");
      return;
    }

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "ng" },
          fields: ["geometry", "formatted_address", "name"],
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (place.geometry) {
          const fullAddress = place.formatted_address || place.name || "";
          const coordinates = {
            lat: place.geometry.location.lat().toString(),
            lng: place.geometry.location.lng().toString(),
          };

          setInternalValue(fullAddress);
          onChange(fullAddress, place, coordinates);
        } else {
          // If no geometry, just update the text value
          const fullAddress = place.name || "";
          setInternalValue(fullAddress);
          onChange(fullAddress);
        }
      });

      // Prevent form submission when pressing Enter
      inputRef.current?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      });

      setApiLoaded(true);
    } catch (error) {
      console.error("Error initializing Autocomplete:", error);
    }
  }, [onChange]);

  useEffect(() => {
    const scriptId = "google-maps-script";
    const existingScript = document.getElementById(scriptId);

    const loadScript = () => {
      if (window.google?.maps?.places) {
        initializeAutocomplete();
        return;
      }

      if (!existingScript) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          setTimeout(() => {
            initializeAutocomplete();
          }, 300);
        };

        script.onerror = () => {
          console.error("Failed to load Google Maps JavaScript API");
        };

        document.body.appendChild(script);
        window.__googleMapsScriptId = scriptId;
      } else if (window.google?.maps?.places) {
        initializeAutocomplete();
      }
    };

    loadScript();

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, [apiKey, initializeAutocomplete]);

  return (
    <div className="google-places-container w-full relative">
      <Input
        {...props}
        ref={inputRef}
        value={internalValue}
        onChange={handleInputChange}
      />
      {!apiLoaded && (
        <div className="text-xs text-gray-500 mt-1">
          Loading location services...
        </div>
      )}
    </div>
  );
};
