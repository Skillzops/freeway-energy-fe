import React from "react";
import useBreakpoint from "../../hooks/useBreakpoint";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ title, value, icon, trend, className }: MetricCardProps) {
  const isMobile = useBreakpoint("max", 640);
  
  return (
    <div className={`bg-white border-[0.4px] border-strokeGreyTwo rounded-[20px] p-4 sm:p-6 hover:border-strokeCream hover:bg-[#f6f7f8] transition-colors duration-300 ease-in-out ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-textDarkGrey uppercase tracking-wide">
            {title}
          </p>
          <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-textBlack mt-1`}>
            {value}
          </div>
          {trend && (
            <p className={`text-xs mt-1 ${
              trend.isPositive ? "text-success" : "text-errorTwo"
            }`}>
              {trend.value}
            </p>
          )}
        </div>
        <div className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-textDarkGrey flex-shrink-0 ml-2`}>
          {icon}
        </div>
      </div>
    </div>
  );
}