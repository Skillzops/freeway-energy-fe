import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { Tag } from "../Products/ProductDetails";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import customericon from "../../assets/customers/customericon.svg";

export type DetailsType = {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  addressType: string;
  location: string;
  longitude: string;
  latitude: string;
};

const CustomerDetails = ({
  refreshTable,
  displayInput,
  ...data
}: DetailsType & {
  refreshTable: KeyedMutator<any>;
  displayInput?: boolean;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    customerId: data.customerId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    addressType: data.addressType,
    location: data.location,
    longitude: data.longitude,
    latitude: data.latitude,
  });
  // const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Check for unsaved changes by comparing the form data with the initial userData
    // if (data[name] !== value) {
    //   setUnsavedChanges(true);
    // } else {
    //   setUnsavedChanges(false);
    // }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Submitted Data:", formData);
      if (refreshTable) await refreshTable();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Settings Icon" /> PERSONAL DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="First Name" />
          {displayInput ? (
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter First Name"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.firstName}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Last Name" />
          {displayInput ? (
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter Last Name"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.lastName}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Email" />
          {displayInput ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">{data.email}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Phone Number" />
          {displayInput ? (
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter Phone Number"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.phoneNumber}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Address Type" />
          {displayInput ? (
            <select
              name="addressType"
              value={formData.addressType}
              onChange={handleChange}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            >
              <option value="HOME">Home</option>
              <option value="WORK">Work</option>
            </select>
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.addressType || "N/A"}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Address" />
          {displayInput ? (
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter Address"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.location || "N/A"}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Longitude" />
          {displayInput ? (
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Enter Longitude"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.longitude || "N/A"}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Latitude" />
          {displayInput ? (
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Enter Latitude"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.latitude || "N/A"}
            </p>
          )}
        </div>
      </div>
      {displayInput && (
        <div className="flex items-center justify-center w-full pt-5 pb-5">
          <ProceedButton
            type="submit"
            loading={loading}
            variant={"gray"}
            disabled={false}
          />
        </div>
      )}
    </form>
  );
};

export default CustomerDetails;
