interface StatisticsCardProps {
  title: string;
  subtitle: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  gradientFrom: string;
  gradientTo: string;
}

const StatisticsCard = ({
  title,
  subtitle,
  value,
  icon,
  iconBgColor,
  gradientFrom,
  gradientTo,
}: StatisticsCardProps) => {
  return (
    <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-xl p-6 border border-gray-100`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="relative">
          <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center`}>
            <div className="w-6 h-6">
          {icon}
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-sm font-medium text-gray-800">{subtitle}</p>
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
};

export default StatisticsCard; 