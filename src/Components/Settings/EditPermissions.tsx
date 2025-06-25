import React, { useEffect, useState } from "react";
import { Input, RadioInput, ToggleInput } from "../InputComponent/Input";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import GroupDisplay from "../GroupComponent/GroupDisplay";
import { GoDotFill } from "react-icons/go";
import { KeyedMutator } from "swr";
import { z } from "zod";
import TabComponent from "../TabComponent/TabComponent";
import { toast } from "react-toastify";
import ApiErrorMessage from "../ApiErrorMessage";

export interface Permission {
  id: string;
  action: string;
  subject: string;
  roleIds: string[];
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
}

const roleSchema = z.object({
  role: z.string().min(1, { message: "Role name is required." }),
  active: z
    .boolean()
    .nullable()
    .transform((val) => val ?? true),
  permissionIds: z
    .array(z.string())
    .optional()
    .refine((arr) => Array.isArray(arr) && arr.length >= 0, {
      message: "Permission IDs must be an array.",
    }),
});

const validSubjects = [
  "Sales",
  "Agents",
  "Customers",
  "Inventory",
  "Accounts",
  "Products",
  "Contracts",
  "Support",
  "Communication",
];
const validActions = ["manage", "read", "write", "delete"];

const EditPermissions = ({
  setIsOpen,
  allRolesRefresh,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allRolesRefresh: KeyedMutator<any>;
}) => {
  const { apiCall } = useApiCall();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [roleActive, setRoleActive] = useState<boolean | null>(null);
  const [permissionIds, setPermissionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );
  const [tabContent, setTabContent] = useState<string>("newRole");
  const [permissionErrors, setPermissionErrors] = useState<any[]>([]);
  const [toggledPermissions, setToggledPermissions] = useState<{
    [key: string]: boolean;
  }>({});

  const {
    data: allPermissions,
    isLoading: allPermissionsLoading,
    error: allPermissionsError,
    errorStates: allPermissionsErrorStates,
    mutate: allPermissionsRefresh,
  } = useGetRequest("/v1/permissions", true);

  const fetchPermissionSubjects = useGetRequest(
    "/v1/permissions/subjects",
    true
  );

  useEffect(() => {
    if (allPermissions) {
      const initialToggledState = allPermissions.reduce(
        (acc: { [x: string]: boolean }, permission: Permission) => {
          acc[`${permission.subject}-${permission.action}`] = true;
          return acc;
        },
        {}
      );
      setToggledPermissions(initialToggledState);
    }
  }, [allPermissions]);

  const resetErrors = (name: string) => {
    // Clear the error for this field when the user selects a value
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError("");
  };

  const handleSubmitRoleCreation = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const validatedData = roleSchema.parse({
        role: selectedRole,
        active: roleActive,
        permissionIds,
      });

      await apiCall({
        endpoint: "/v1/roles",
        method: "post",
        data: {
          role: validatedData.role,
          active: validatedData.active,
          permissionIds: validatedData.permissionIds,
        },
        successMessage: "Role created successfully!",
      });
      await allRolesRefresh();
      setLoading(false);
      setSelectedRole("");
      setPermissionIds([]);
      setRoleActive(null);
      setIsOpen(false);
    } catch (error: any) {
      setLoading(false);
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message || "Internal Server Error";
        setApiError(`Role creation failed: ${message}.`);
      }
    }
  };

  const handlePermissionCall = async (
    method: "post" | "delete",
    endpoint: string,
    data: { subject: string; action: string },
    fieldId: string
  ) => {
    setFormErrors([]);
    setApiError("");

    try {
      await apiCall({
        endpoint,
        method,
        data,
        showToast: false,
      });
      await fetchPermissionSubjects?.mutate();
      await allPermissionsRefresh();
      // Clear any existing errors for this permission
      setPermissionErrors((prevErrors) =>
        prevErrors.filter((error) => error.fieldId !== fieldId)
      );
    } catch (error: any) {
      const message = error?.response?.data?.message || "Internal Server Error";
      // Update the permissionErrors state to store the error for this fieldId
      setPermissionErrors((prevErrors) => [...prevErrors, { fieldId }]);
      // Revert the toggledPermissions state on error
      setToggledPermissions((prev) => ({
        ...prev,
        [fieldId]: !prev[fieldId],
      }));
      toast.error(
        `Failed to update "${data.subject} - ${data.action}" permission.`
      );
      setApiError(
        `${data.subject} - ${data.action} permission update failed: ${message}.`
      );
    }
  };

  const handlePermissionCreation = async (
    subject: string,
    action: string,
    checked: boolean,
    permission: Permission | null
  ) => {
    const fieldId = `${subject}-${action}`;

    // Add this block to immediately update the UI
    setToggledPermissions((prev) => ({
      ...prev,
      [fieldId]: checked,
    }));

    if (!checked) {
      if (permission?.id) {
        await handlePermissionCall(
          "delete",
          `/v1/permissions/${permission.id}`,
          { subject, action },
          fieldId
        );
      }
    } else {
      if (!validSubjects.includes(subject)) {
        toast.error(
          `Invalid subject: "${subject}". Please select a valid subject.`
        );
        return;
      }

      if (!validActions.includes(action)) {
        toast.error(
          `Invalid action: "${action}". Please select a valid action.`
        );
        return;
      }

      await handlePermissionCall(
        "post",
        "/v1/permissions",
        {
          action,
          subject,
        },
        fieldId
      );
    }
  };

  const GroupWrapper = ({ variant }: { variant?: string }) => {
    const actionOrder = ["manage", "read", "write", "delete"];
    const groupItems = fetchPermissionSubjects?.data?.subjects?.map(
      (subject: string) => {
        // Filter permissions for this subject
        const subjectPermissions = allPermissions
          ?.filter((permission: Permission) => permission.subject === subject)
          .sort(
            (a: { action: string }, b: { action: string }) =>
              actionOrder.indexOf(a.action) - actionOrder.indexOf(b.action)
          );

        const hasToggled = subjectPermissions.some((permission: Permission) =>
          permissionIds.includes(permission.id)
        );

        return {
          title: subject,
          hasToggled,
          content:
            variant === "allPermissions" ? (
              <div className="flex flex-col gap-2">
                {validActions.map((action: string, index) => {
                  const fieldId = `${subject}-${action}`;
                  const specificPermission = subjectPermissions?.find(
                    (permission: Permission) => permission?.action === action
                  );
                  return (
                    <div key={index} className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between w-full">
                        <p className="flex items-center justify-center gap-0.5 w-max bg-[#F6F8FA] px-2 h-6 rounded-full text-xs font-medium capitalize border-[0.6px] border-strokeGreyTwo">
                          <GoDotFill color="#050505" />
                          {action}
                        </p>
                        <div className="flex items-center justify-end gap-2 w-max">
                          <ToggleInput
                            defaultChecked={
                              toggledPermissions[fieldId] || false
                            }
                            onChange={(checked: boolean) => {
                              handlePermissionCreation(
                                subject,
                                action,
                                checked,
                                specificPermission || null
                              );
                            }}
                          />
                        </div>
                      </div>
                      {permissionErrors.find(
                        (error) => error.fieldId === fieldId
                      ) && (
                        <p className="text-xs text-errorTwo font-semibold w-full">
                          {`Failed to update "${fieldId}" permission.`}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              subjectPermissions?.map((permission: Permission) => (
                <PermissionComponent
                  key={permission.id}
                  permission={permission}
                  permissionIds={permissionIds}
                  setPermissionIds={setPermissionIds}
                  resetErrors={() => resetErrors("permissionIds")}
                />
              ))
            ),
        };
      }
    );

    return <GroupDisplay items={groupItems} />;
  };

  const AllPermissions = () => {
    return (
      <div className="flex flex-col w-full gap-4 border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <GroupWrapper variant="allPermissions" />
      </div>
    );
  };

  const isFormFilled = roleSchema.safeParse({
    role: selectedRole,
    active: roleActive,
    permissionIds,
  }).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  const tabNames = [
    { name: "New Role", key: "newRole", count: null },
    { name: "Manage Permissions", key: "managePermissions", count: null },
  ];

  return (
    <DataStateWrapper
      isLoading={allPermissionsLoading}
      error={allPermissionsError}
      errorStates={allPermissionsErrorStates}
      refreshData={allPermissionsRefresh}
      errorMessage="Failed to fetch permissions."
    >
      <form
        className="flex flex-col bg-white pb-8"
        onSubmit={handleSubmitRoleCreation}
        noValidate
      >
        <div
          className={`flex items-center justify-center px-4 min-h-[64px] border-b-[0.6px] border-strokeGreyThree ${
            isFormFilled
              ? "bg-paleCreamGradientLeft"
              : "bg-paleGrayGradientLeft"
          }`}
        >
          <h2
            style={{ textShadow: "1px 1px grey" }}
            className="text-xl text-textBlack font-semibold font-secondary"
          >
            {tabContent === "newRole"
              ? "New Role & Permissions"
              : "Manage Permissions"}
          </h2>
        </div>
        <div className="flex items-center px-4 py-4 w-full">
          <TabComponent
            tabs={tabNames.map(({ name, key, count }) => ({
              name,
              key,
              count,
            }))}
            onTabSelect={(key) => setTabContent(key)}
            tabsContainerClass="p-2 rounded-[20px]"
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-6 px-4 py-2">
          {tabContent === "newRole" ? (
            <>
              <Input
                type="text"
                name="role"
                label="ROLE NAME"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  resetErrors(e.target.name);
                }}
                placeholder="Role Name"
                required={true}
                errorMessage={getFieldError("role")}
              />
              <div className="flex flex-col w-full gap-2">
                <div
                  className={`relative flex items-center justify-between bg-white px-[1.1em] py-[1em] border-[0.6px] ${
                    roleActive !== null
                      ? "border-strokeCream"
                      : "border-strokeGrey"
                  } w-full transition-all rounded-[20px]`}
                >
                  <span
                    className={`absolute flex -top-2 items-center justify-center text-[10px] text-textGrey font-semibold px-2 py-0.5 max-w-max h-4 bg-white border-[0.6px] border-strokeCream rounded-[200px] transition-opacity duration-500 ease-in-out
                  ${roleActive !== null ? "opacity-100" : "opacity-0"}`}
                  >
                    Role Active Status
                  </span>
                  <p
                    className={`w-full text-sm ${
                      roleActive !== null
                        ? "text-textBlack font-semibold"
                        : "text-textGrey italic"
                    }`}
                  >
                    Role Active Status
                  </p>
                  <RadioInput
                    name="active"
                    value={
                      roleActive === null || roleActive === true
                        ? "true"
                        : "false"
                    }
                    onChange={(e) => {
                      setRoleActive(e.target.value === "true" ? true : false);
                      resetErrors(e.target.name);
                    }}
                    required={false}
                    radioOptions={[
                      {
                        label: "True",
                        value: "true",
                      },
                      {
                        label: "False",
                        value: "false",
                      },
                    ]}
                  />
                </div>
                {getFieldError("active") && (
                  <p className="px-2 text-[11px] text-errorTwo font-semibold w-full">
                    {getFieldError("active")}
                  </p>
                )}
              </div>
              <div className="flex flex-col w-full gap-2">
                <div
                  className={`relative flex flex-col w-full gap-0.5 border-[0.6px] ${
                    permissionIds.length > 0
                      ? "border-strokeCream"
                      : "border-strokeGrey"
                  } rounded-[20px] transition-all`}
                >
                  <span
                    className={`absolute z-10 flex -top-2 ml-5 items-center justify-center text-[10px] text-textGrey font-semibold px-2 py-0.5 max-w-max h-4 bg-white border-[0.6px] border-strokeGreyTwo rounded-[200px] transition-opacity duration-500 ease-in-out ${
                      permissionIds.length > 0 ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    PERMISSIONS
                  </span>
                  <GroupWrapper />
                </div>
                {getFieldError("permissionIds") && (
                  <p className="px-2 text-[11px] text-errorTwo font-semibold w-full">
                    {getFieldError("permissionIds")}
                  </p>
                )}
              </div>
            </>
          ) : (
            <AllPermissions />
          )}

          <ApiErrorMessage apiError={apiError} />

          {isFormFilled && (
            <ProceedButton
              type="submit"
              variant={isFormFilled ? "gradient" : "gray"}
              loading={loading}
              disabled={!isFormFilled}
            />
          )}
        </div>
      </form>
    </DataStateWrapper>
  );
};

export default EditPermissions;

export const PermissionComponent = ({
  permission,
  permissionIds,
  setPermissionIds,
  resetErrors,
}: {
  permission: any;
  permissionIds: string[];
  setPermissionIds: React.Dispatch<React.SetStateAction<string[]>>;
  resetErrors?: () => void;
}) => {
  // Check if the permission ID is in the array
  const isChecked = permissionIds.includes(permission.id);
  const handlePermissionChange = (checked: boolean, id: string) => {
    if (checked) {
      // Add the id to the array if checked
      setPermissionIds((prev) => [...prev, id]);
    } else {
      // Remove the id from the array if unchecked
      setPermissionIds((prev) =>
        prev.filter((permissionId) => permissionId !== id)
      );
    }
    resetErrors!();
  };

  return (
    <div className="flex items-center justify-between w-full">
      <p className="flex items-center justify-center gap-0.5 bg-[#F6F8FA] px-2 h-6 rounded-full text-xs font-medium capitalize border-[0.6px] border-strokeGreyTwo">
        <GoDotFill color="#050505" />
        {permission.action}
      </p>

      <ToggleInput
        defaultChecked={isChecked}
        onChange={(checked: boolean) => {
          handlePermissionChange(checked, permission.id);
        }}
      />
    </div>
  );
};
