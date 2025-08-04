import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { observer } from "mobx-react-lite";
import { Tag } from "../Products/ProductDetails";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import customericon from "../../assets/customers/customericon.svg";
import rootStore from "../../stores/rootStore";

export interface AgentUserType {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  location: string;
  longitude: string;
  latitude: string;
  addressType: string;
  status: string;
  emailVerified: boolean;
  category?: string;
}

const AgentDetails = observer(({
  refreshTable,
  displayInput,
  ...data
}: AgentUserType & {
  refreshTable: KeyedMutator<any>;
  displayInput: boolean;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    id: data.id,
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    phone: data.phone,
    location: data.location,
    longitude: data.longitude,
    latitude: data.latitude,
    addressType: data.addressType,
    status: data.status,
    emailVerified: data.emailVerified,
    agentsId: data.id
  });

  // Get assigned data from store - access directly to ensure MobX tracking
  const { agentAssignmentStore } = rootStore;
  
  // Access the assignments array directly to ensure MobX tracks changes
  const assignments = agentAssignmentStore.assignments;
  const assignedData = assignments.find(a => a.agentId === data.id);
  
  // Check if all items are assigned
  const allAssigned = assignedData ? 
    (assignedData.customers.length > 0 && assignedData.products.length > 0 && assignedData.installers.length > 0) : 
    false;



  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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

  const handleProceed = () => {
    console.log("Proceeding with agent setup...");
    // TODO: Implement proceed logic - this could clear the assignments
    // agentAssignmentStore.clearAgentAssignments(data.id);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Settings Icon" /> AGENT ID
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Agent ID" />
          <p className="text-xs font-bold text-textDarkGrey">
            {data.id || "N/A"}
          </p>
        </div>
      </div>

      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Settings Icon" /> AGENT CATEGORY
        </p>
        <div className="flex items-center justify-between">
          <Tag name="Category" />
          <p className="text-xs font-bold text-textDarkGrey">
            {data.category || "SALES"}
          </p>
        </div>
      </div>
     
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Settings Icon" /> PERSONAL DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="First Name" />
          {displayInput ? (
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="Enter First Name"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.firstname}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Last Name" />
          {displayInput ? (
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Enter Last Name"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.lastname}
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
            <p className="text-xs font-bold text-textDarkGrey">
              {data.email}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Phone" />
          {displayInput ? (
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter Phone Number"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.phone || "N/A"}
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

      {/* Upcoming Tasks Section - Only show for non-installer agents */}
      {data.category !== "INSTALLER" && (
        <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
          <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-textLightGrey">
              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            UPCOMING TASKS
          </p>

          {/* Assigned Customers */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${assignedData?.customers?.length && assignedData.customers.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs font-medium text-textDarkGrey">Assigned Customers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-textGrey">{assignedData?.customers?.length || 0} assigned</span>
              {assignedData?.customers && assignedData.customers.length > 0 && (
                <div className="flex -space-x-1">
                  {assignedData.customers.slice(0, 2).map((customer, index) => (
                    <div key={customer.id} className="w-5 h-5 bg-[#A58730] rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{customer.name.charAt(0)}</span>
                    </div>
                  ))}
                  {assignedData.customers && (assignedData.customers?.length || 0) > 2 && (
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-textDarkGrey font-bold">+{(assignedData.customers?.length || 0) - 2}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Assigned Products */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${assignedData?.products?.length && assignedData.products.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs font-medium text-textDarkGrey">Assigned Products</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-textGrey">{assignedData?.products?.length || 0} assigned</span>
              {assignedData?.products && assignedData.products.length > 0 && (
                <div className="flex -space-x-1">
                  {assignedData.products.slice(0, 2).map((product, index) => (
                    <div key={product.id} className="w-5 h-5 bg-[#982214] rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{product.name.charAt(0)}</span>
                    </div>
                  ))}
                  {assignedData.products && (assignedData.products?.length || 0) > 2 && (
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-textDarkGrey font-bold">+{(assignedData.products?.length || 0) - 2}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Assigned Installers */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${assignedData?.installers?.length && assignedData.installers.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs font-medium text-textDarkGrey">Assigned Installers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-textGrey">{assignedData?.installers?.length || 0} assigned</span>
              {assignedData?.installers && assignedData.installers.length > 0 && (
                <div className="flex -space-x-1">
                  {assignedData.installers.slice(0, 2).map((installer, index) => (
                    <div key={installer.id} className="w-5 h-5 bg-[#F8CB48] rounded-full flex items-center justify-center">
                      <span className="text-xs text-textBlack font-bold">{installer.name.charAt(0)}</span>
                    </div>
                  ))}
                  {assignedData.installers && (assignedData.installers?.length || 0) > 2 && (
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-textDarkGrey font-bold">+{(assignedData.installers?.length || 0) - 2}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Proceed Button - Only show when all items are assigned */}
          {allAssigned && (
            <div className="flex items-center justify-center w-full pt-4">
              <button
                onClick={handleProceed}
                type="button"
                className="flex items-center justify-center gap-2 bg-[#A58730] text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-[#8B6F2A] transition-colors"
              >
                <span>Proceed</span>
              </button>
            </div>
          )}
        </div>
      )}

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
});

export default AgentDetails;
