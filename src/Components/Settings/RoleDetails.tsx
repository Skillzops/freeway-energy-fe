import { useMemo, useState } from "react";
import { z } from "zod";
import { DetailComponent } from "./ViewRolePermissions";
import { checkIfArraysAreEqual, formatDateTime } from "@/utils/helpers";
import role from "../../assets/table/role.svg";
import roletwo from "../../assets/table/roletwo.svg";
import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import { KeyedMutator } from "swr";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { SmallInput, RadioInput } from "../InputComponent/Input";
import GroupDisplay from "../GroupComponent/GroupDisplay";
import { Permission, PermissionComponent } from "./EditPermissions";
import ApiErrorMessage from "../ApiErrorMessage";

const formSchema = z.object({
  role: z.string().trim().optional().default(""),
  active: z.boolean().optional().default(true),
  permissionIds: z.array(z.string()).optional().default([""]),
});

type FormData = z.infer<typeof formSchema>;

const RoleDetails = ({
  fetchSingleRoleData,
  userCount,
  editInput,
  roleData,
  refreshTable,
  refreshRoleDetails,
  setEditInput,
}: {
  fetchSingleRoleData: any;
  userCount: number;
  editInput: boolean;
  roleData: {
    id: string;
    role: string;
    active: boolean;
    permissionIds: string[];
    permissions: {
      id: string;
      action: string;
      subject: string;
    }[];
  };
  refreshTable: KeyedMutator<any>;
  refreshRoleDetails: KeyedMutator<any>;
  setEditInput: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { apiCall } = useApiCall();

  const {
    data: allPermissions,
    isLoading: allPermissionsLoading,
    error: allPermissionsError,
  } = useGetRequest("/v1/permissions", true);

  const fetchPermissionSubjects = useGetRequest(
    "/v1/permissions/subjects",
    true
  );

  const fetchSingleUser = useGetRequest(
    `/v1/users/single/${fetchSingleRoleData?.data?.created_by}`,
    true
  );

  const defaultFormData = useMemo(() => {
    return {
      role: roleData.role,
      active: roleData.active,
      permissionIds: roleData.permissions.map((item) => item.id),
    };
  }, [roleData]);

  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );
  const [permissionIds, setPermissionIds] = useState<string[]>(
    defaultFormData.permissionIds
  );

  const unsaved =
    formData?.role?.trim() !== defaultFormData?.role ||
    formData?.active !== defaultFormData?.active ||
    !checkIfArraysAreEqual(permissionIds, defaultFormData?.permissionIds);

  const resetFormErrors = (name: string) => {
    // Clear the error for this field when the user starts typing
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" && name === "active" ? value === "true" : value,
    }));
    resetFormErrors(name);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    try {
      // Validate the form data before proceeding
      const newFormData = { ...formData, permissionIds };
      const validatedData = formSchema.parse(newFormData);

      // Construct the payload with only changed fields
      const payload: Partial<FormData> = {};
      if (newFormData.role.trim() !== defaultFormData.role) {
        payload.role = validatedData.role;
      }
      if (newFormData.active !== defaultFormData.active) {
        payload.active = validatedData.active;
      }
      if (
        !checkIfArraysAreEqual(
          newFormData.permissionIds,
          defaultFormData.permissionIds
        )
      ) {
        payload.permissionIds = validatedData.permissionIds;
      }

      // If nothing has changed, avoid making the API call
      if (Object.keys(payload).length === 0) {
        setLoading(false);
        return;
      }

      await apiCall({
        endpoint: `/v1/roles/${roleData.id}`,
        method: "put",
        data: payload,
        successMessage: "Role updated successfully!",
      });
      await refreshRoleDetails();
      setEditInput(false);
      setFormData(defaultFormData);
      await refreshTable();
    } catch (error: any) {
      setLoading(false);
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message ||
          "Updating role failed: Internal Server Error";
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled =
    unsaved && formSchema.safeParse({ ...formData, permissionIds }).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  const GroupWrapper = () => {
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
          content: subjectPermissions?.map((permission: Permission) => (
            <PermissionComponent
              key={permission.id}
              permission={permission}
              permissionIds={permissionIds}
              setPermissionIds={setPermissionIds}
            />
          )),
        };
      }
    );

    return (
      <div className="flex flex-col w-full gap-0.5 border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <GroupDisplay items={groupItems} />
      </div>
    );
  };

  return (
    <form
      className="flex flex-col items-center gap-4 w-full bg-white"
      onSubmit={handleSubmit}
      noValidate
    >
      <DetailComponent
        label="Role Title"
        value={fetchSingleRoleData?.data?.role}
        inputComponent={
          !editInput ? null : (
            <SmallInput
              type="text"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              placeholder="First Name"
              required={false}
              errorMessage={getFieldError("firstname")}
            />
          )
        }
      />

      <DetailComponent
        label="Role Active Status"
        value={fetchSingleRoleData?.data?.active === true ? "True" : "False"}
        inputComponent={
          !editInput ? null : (
            <RadioInput
              name="active"
              value={formData.active === true ? "true" : "false"}
              onChange={handleInputChange}
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
              className="px-2 py-1 h-[24px]"
              radioLabelStyle="text-xs"
            />
          )
        }
      />

      {editInput &&
        (allPermissionsLoading ? (
          <p className="text-xs text-textBlack font-medium w-full">
            Fetching Permisssiions...
          </p>
        ) : allPermissionsError ? (
          <p className="text-xs text-errorTwo font-semibold w-full">
            Failed to fetch permissions
          </p>
        ) : (
          <GroupWrapper />
        ))}

      {!editInput && (
        <>
          <div className="flex flex-col w-full p-2.5 gap-2 rounded-[20px] border-[0.6px] border-strokeGreyThree">
            <p className="flex gap-1 w-max text-xs text-textLightGrey font-medium pb-2">
              <img src={role} alt="Role Icon" width="16px" />
              ROLE DETAILS
            </p>
            {fetchSingleUser?.data?.firstname && (
              <DetailComponent
                label="Created By"
                value={
                  fetchSingleUser?.data?.firstname
                    ? `${fetchSingleUser?.data?.firstname} ${fetchSingleUser?.data?.lastname}`
                    : "N/A"
                }
                parentClass="border-none p-0"
                valueClass="bg-[#EFF2FF] px-2 py-1 rounded-full"
                icon={roletwo}
              />
            )}
            {fetchSingleUser?.data?.firstname && (
              <DetailComponent
                label="Designation"
                value={fetchSingleUser?.data?.role?.role || ""}
                parentClass="border-none p-0"
              />
            )}
            <DetailComponent
              label="Date Created"
              value={formatDateTime(
                "datetime",
                fetchSingleRoleData?.data?.created_at
              )}
              parentClass="border-none p-0"
            />
          </div>
          <DetailComponent label="Assigned Users" value={userCount} />
        </>
      )}

      <ApiErrorMessage apiError={apiError} />

      {editInput && (
        <ProceedButton
          type="submit"
          variant={isFormFilled ? "gradient" : "gray"}
          loading={loading}
          disabled={!isFormFilled}
        />
      )}
    </form>
  );
};

export default RoleDetails;
