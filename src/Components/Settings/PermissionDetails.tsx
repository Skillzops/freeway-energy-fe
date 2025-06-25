import { GoDotFill } from "react-icons/go";
import { DetailComponent } from "./ViewRolePermissions";

const PermissionDetails = ({
  fetchSingleRoleData,
}: {
  fetchSingleRoleData: any;
}) => {
  const newSubjectData =
    Array.from(
      new Map(
        fetchSingleRoleData?.data?.permissions.map((permission: any) => [
          permission?.subject,
          permission,
        ])
      ).values()
    ) || [];

  return (
    <>
      <DetailComponent
        label="No of Permissions"
        value={newSubjectData?.length}
      />
      <div className="flex items-center justify-between w-full p-2.5 gap-2 rounded-[20px] border-[0.6px] border-strokeGreyThree">
        <div className="w-[40%]">
          <span className="bg-[#EFF2FF] text-xs px-2 py-1 rounded-full text-[#3951B6]">
            Permissions
          </span>
        </div>
        <div className="flex flex-wrap justify-end gap-4 w-[60%]">
          {fetchSingleRoleData?.data?.permissions?.length > 0 ? (
            newSubjectData?.map((permission: any, index: number) => (
              <span
                key={permission?.id || index}
                className="flex w-max items-center justify-center gap-1 bg-[#F6F8FA] px-2 py-1 text-xs text-textDarkGrey border-[0.4px] border-strokeGreyThree rounded-full uppercase"
              >
                <GoDotFill color="#9BA4BA" />
                {permission?.subject}
              </span>
            ))
          ) : (
            <p className="text-xs text-textDarkGrey uppercase">
              No permission assigned
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default PermissionDetails;
