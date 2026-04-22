import { Link } from "react-router-dom";

const UserPill = ({ role }: { role: string }) => {
  const productRoleColor = "#32290E";

  return (
    <Link
      to={"/settings/profile"}
      className="flex items-center justify-center p-1 gap-1 w-max bg-[#F6F8FA] border-[0.2px] border-strokeGreyThree rounded-[32px]"
      onClick={() => {}}
    >
      <span
        className="flex items-center justify-center w-[24px] h-[24px] bg-[#F6F8FA] border-[0.2px] border-strokeGreyThree rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
        style={{ color: productRoleColor }}
        aria-hidden="true"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="8.5" r="4" fill="currentColor" />
          <path d="M5 19.5C6.5 16 9.5 14.5 12 14.5C14.5 14.5 17.5 16 19 19.5" fill="currentColor" />
        </svg>
      </span>
      <p
        className="px-2 py-1 text-xs text-white font-medium rounded-full capitalize"
        style={{ backgroundColor: productRoleColor }}
      >
        {role}
      </p>
    </Link>
  );
};

export default UserPill;
