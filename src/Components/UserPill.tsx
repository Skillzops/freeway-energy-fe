import { Link } from "react-router-dom";
import sampleimage from "../assets/sampleuserimage.svg";

const UserPill = ({ role }: { role: string }) => {
  return (
    <Link
      to={"/settings/profile"}
      className="flex items-center justify-center p-1 gap-1 w-max bg-[#FEF5DA] border-[0.2px] border-[#A58730] rounded-[32px]"
      onClick={() => {}}
    >
      <img
        src={sampleimage}
        alt="User Image"
        className="w-[24px] h-[24px] border-[0.2px] border-[#A58730] rounded-full"
      />
      <p className="px-2 py-1 bg-[#32290E] text-xs text-white font-medium rounded-full capitalize">
        {role}
      </p>
    </Link>
  );
};

export default UserPill;
