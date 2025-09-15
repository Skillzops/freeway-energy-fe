import clsx from "clsx";

interface DashboardCardProps {
  icon: string;
  title: string;
  value: string | number;
  description: string;
  prefix?: string;
  bgColor?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  title,
  value,
  description,
  prefix,
  bgColor = "bg-white",
}) => {
  return (
    <div
      className={clsx(
        "flex flex-col justify-between p-6 rounded-2xl shadow-md w-full h-full",
        bgColor
      )}
    >
      <div className="flex items-center gap-4">
        <img src={icon} alt={title} className="w-10 h-10" />
        <div className="flex flex-col">
          <p className="text-xs text-textGrey leading-tight">{description}</p>
          <p className="text-sm font-bold text-textDarkGrey">{title}</p>
        </div>
      </div>
      <div className="mt-4">
        {prefix && (
          <span className="text-sm text-textDarkGrey font-bold">{prefix}</span>
        )}
        <p className="text-2xl font-lora text-black leading-tight">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
