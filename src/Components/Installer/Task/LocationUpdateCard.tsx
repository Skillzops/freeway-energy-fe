import React, { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
// import closeIcon from "../../assets/close.svg";
import curvedlines from "@/assets/sales/curvedlines.png";
import redcustomerbag from "@/assets/customers/redcustomerbag.svg";
import LocationSuccessCard from "./LocationSuccessCard";
import { FiMapPin } from "react-icons/fi";

// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { z } from "zod";
import closeIcon from '@/assets/close.svg';
// import curvedlines from "@/assets/sales/curvedlines.png";
// import redcustomerbag from "@/assets/customers/redcustomerbag.svg";
// import LocationSuccessCard from "./LocationSuccessCard";
import SecondaryButton from '@/Components/SecondaryButton/SecondaryButton';

/* --------------------------- Validation (Zod) --------------------------- */
const locationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
});
type LocationFormData = z.infer<typeof locationSchema>;

/* ------------------------------ Types ---------------------------------- */
export interface ILocation {
  location: string;
  longitude: string; // required
  latitude: string;  // required
}

interface LocationUpdateCardProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateLocation: (data: ILocation) => Promise<void> | void;
  loading?: boolean
}

/* ------------------- Google Maps loader (idempotent) ------------------- */
let mapsPromise: Promise<void> | null = null;
function loadGoogleMaps(apiKey: string): Promise<void> {
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise<void>((resolve, reject) => {
    if ((window as any).google?.maps?.places) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps JS API"));
    document.head.appendChild(script);
  });

  return mapsPromise;
}

/* --------------------------- Component --------------------------------- */
const LocationUpdateCard: React.FC<LocationUpdateCardProps> = ({
  isOpen,
  onClose,
  onUpdateLocation,
  loading,
}) => {
  const [formData, setFormData] = useState<LocationFormData>({
    address: "",
    latitude: "",
    longitude: "",
  });
  const [errors, setErrors] = useState<Partial<LocationFormData>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [locStatus, setLocStatus] = useState<
    | { state: "idle"; message?: string }
    | { state: "loading"; message?: string }
    | { state: "error"; message: string }
    | { state: "success"; message?: string }
  >({ state: "idle" });
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const acCleanupRef = useRef<(() => void) | null>(null);

  const apiKey = useMemo(
    () => (import.meta.env.VITE_GOOGLE_API_KEY as string) || "",
    []
  );
  const shouldInitMaps = isOpen && !!apiKey;

  // Initialize classic Places Autocomplete on the input
  useEffect(() => {
    if (!shouldInitMaps) return;

    let destroyed = false;

    (async () => {
      try {
        await loadGoogleMaps(apiKey);
        if (destroyed || !inputRef.current || !(window as any).google?.maps?.places) return;

        const googleObj: any = (window as any).google;

        const ac = new googleObj.maps.places.Autocomplete(inputRef.current, {
          types: ["geocode"],
          componentRestrictions: { country: ["ng"] },
          fields: ["geometry", "formatted_address", "name"],
        });

        const onPlaceChanged = () => {
          const place = ac.getPlace?.();
          if (place?.geometry) {
            const fullAddress = place.formatted_address || place.name || inputRef.current!.value || "";
            const lat = place.geometry.location?.lat?.().toString?.() ?? "";
            const lng = place.geometry.location?.lng?.().toString?.() ?? "";
            setFormData((prev) => ({
              ...prev,
              address: fullAddress,
              latitude: lat,
              longitude: lng,
            }));
          }
        };

        ac.addListener("place_changed", onPlaceChanged);

        acCleanupRef.current = () => {
          try {
            googleObj.maps.event.clearInstanceListeners(ac);
          } catch {
            // no-op
          }
        };
      } catch (e) {
        // fallback: user can type manually
        console.error("Maps init error:", e);
      }
    })();

    return () => {
      destroyed = true;
      acCleanupRef.current?.();
      acCleanupRef.current = null;
    };
  }, [shouldInitMaps, apiKey]);

  const handleDone = async () => {
    try {
      const validated = locationSchema.parse(formData);

      const payload: ILocation = {
        location: validated.address,
        longitude: validated.longitude, // correct mapping
        latitude: validated.latitude,   // correct mapping
      };

      await Promise.resolve(onUpdateLocation(payload));
      setShowSuccess(true);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<LocationFormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as keyof LocationFormData] = err.message;
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
    console.log("Request token clicked");
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!apiKey) throw new Error("Google API key missing. Set VITE_GOOGLE_API_KEY.");
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to reach Google Geocoding API");
    const data = await res.json();
    if (data.status !== "OK") throw new Error(data.error_message || "Unable to resolve address");
    return data.results?.[0]?.formatted_address as string | undefined;
  };

  const handleUseCurrentLocation = () => {
    if (!apiKey) {
      setLocStatus({
        state: "error",
        message: "Google API key not configured. Add VITE_GOOGLE_API_KEY to your .env file.",
      });
      return;
    }

    if (!navigator?.geolocation) {
      setLocStatus({ state: "error", message: "Geolocation not supported on this device." });
      return;
    }

    setLocStatus({ state: "loading", message: "Requesting device location..." });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const latStr = latitude.toString();
        const lngStr = longitude.toString();

        setFormData((prev) => ({ ...prev, latitude: latStr, longitude: lngStr }));

        try {
          const address = await reverseGeocode(latitude, longitude);
          if (address) {
            setFormData((prev) => ({ ...prev, address }));
            setLocStatus({ state: "success", message: "Location auto-filled" });
          } else {
            setLocStatus({
              state: "error",
              message: "Coordinates found but address not resolved. Please edit manually.",
            });
          }
        } catch (err: any) {
          setLocStatus({
            state: "error",
            message: err?.message || "Couldn't fetch address. Coordinates filled.",
          });
        } finally {
          setLastUpdated(new Date().toLocaleString());
        }
      },
      (error) => {
        const reason =
          error.code === error.PERMISSION_DENIED
            ? "Permission denied. Enable location access in your browser settings."
            : error.code === error.POSITION_UNAVAILABLE
            ? "Location unavailable. Check GPS/network."
            : "Timed out while fetching location.";
        setLocStatus({ state: "error", message: reason });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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
          backgroundRepeat: "no-repeat",
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

            <div className="flex justify-start pl-4 mb-6">
              <img src={redcustomerbag} alt="Shopping Bag" className="w-20 h-20" />
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-100 rounded-lg p-4 mb-6">
                <p className="text-textBlack text-sm italic">
                  Try inputting the installation address, or use the Google suggestion box to select an address.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-sm text-textBlack font-semibold">Quick fill</p>
                  <SecondaryButton
                    variant="secondary"
                    className="bg-gradient-to-r from-red-500 to-red-700 text-white px-0 py-2"
                    onClick={handleUseCurrentLocation}
                    aria-label="Use current location"
                    title="Use current location"
                    size="sm"
                  >
                    {locStatus.state === "loading" ? (
                      "Fetching..."
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <FiMapPin className="w-5 h-5" />
                        <span className="sr-only">Use Current Location</span>
                      </span>
                    )}
                  </SecondaryButton>
                </div>
                {locStatus.state !== "idle" && (
                  <p
                    className={`text-xs ${
                      locStatus.state === "error" ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {locStatus.message}
                    {lastUpdated && ` • Last updated: ${lastUpdated}`}
                  </p>
                )}

                {/* Address + Autocomplete */}
                <div className="w-full">
                  <div className="relative autofill-parent flex items-center w-full px-[1.1em] py-[1.25em] gap-1 rounded-3xl h-[48px] border-[0.6px] border-strokeGrey transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
                    <span className="absolute flex -top-2 items-center justify-center text-sm text-textGrey font-semibold px-2 py-0.5 max-w-max h-4 bg-white border-[0.6px] border-strokeCream rounded-[200px]">
                      GOOGLE ADDRESS
                    </span>
                    <input
                      ref={inputRef}
                      id="google-address-input"
                      type="text"
                      placeholder="Enter installation address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, address: e.target.value }))
                      }
                      className="w-full text-sm font-semibold text-textBlack placeholder:text-textGrey placeholder:font-normal placeholder:italic"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-xs text-red-600 mt-1">{errors.address}</p>
                  )}
                </div>

                {/* Longitude */}
                <div className="w-full">
                  <div className="relative autofill-parent flex items-center w-full px-[1.1em] py-[1.25em] gap-1 rounded-3xl h-[48px] border-[0.6px] border-strokeGrey transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
                    <span className="absolute flex -top-2 items-center justify-center text-sm text-textGrey font-semibold px-2 py-0.5 max-w-max h-4 bg-white border-[0.6px] border-strokeCream rounded-[200px]">
                      LONGITUDE
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="7.4951"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, longitude: e.target.value }))
                      }
                      className="w-full text-sm font-semibold text-textBlack placeholder:text-textGrey placeholder:font-normal placeholder:italic"
                    />
                  </div>
                  {errors.longitude && (
                    <p className="text-xs text-red-600 mt-1">{errors.longitude}</p>
                  )}
                </div>

                {/* Latitude */}
                <div className="w-full">
                  <div className="relative autofill-parent flex items-center w-full px-[1.1em] py-[1.25em] gap-1 rounded-3xl h-[48px] border-[0.6px] border-strokeGrey transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
                    <span className="absolute flex -top-2 items-center justify-center text-sm text-textGrey font-semibold px-2 py-0.5 max-w-max h-4 bg-white border-[0.6px] border-strokeCream rounded-[200px]">
                      LATITUDE
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="6.5244"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, latitude: e.target.value }))
                      }
                      className="w-full text-sm font-semibold text-textBlack placeholder:text-textGrey placeholder:font-normal placeholder:italic"
                    />
                  </div>
                  {errors.latitude && (
                    <p className="text-xs text-red-600 mt-1">{errors.latitude}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1">
            <SecondaryButton variant="secondary" onClick={onClose}>
              Cancel
            </SecondaryButton>
            <SecondaryButton
              disabled={
                !formData.address.trim() ||
                !formData.latitude.trim() ||
                !formData.longitude.trim()
              }
              onClick={handleDone}
              className="bg-gradient-to-r from-orange-400 to-orange-600 text-white"
            >
            {loading? "Updating...": "Done"}
            </SecondaryButton>
          </div>
        </div>
      </div>

      {/* Success Card */}
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
