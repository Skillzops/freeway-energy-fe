import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import dashboard from "@/assets/home/dashboard.svg";
import installer from "@/assets/home/installer.svg";
import settings from "@/assets/home/settings.svg";
import useBreakpoint from "@/hooks/useBreakpoint";
import ProceedButton from "@/Components/ProceedButtonComponent/ProceedButtonComponent";

type SectionData = {
  sectionName: string;
  notificationCount?: number;
  sectionImage: string;
  location: string;
};

const AgentHome = () => {
  const navigate = useNavigate();
  const isMobile = useBreakpoint("max", 640);
  const notificationCounts = {
    Agents: 0,
    Contracts: 10,
    Settings: 0,
  };
  const homeData = [
    { sectionName: "Dashboard", sectionImage: dashboard, location: "/installer/dashboard" },
    {
      sectionName: "Installer",
      sectionImage: installer,
      location: "/installer/Installer",
    },
    {
      sectionName: "Commissions",
      sectionImage: installer,
      location: "/installer/commissions",
    },
    { sectionName: "Settings", sectionImage: settings, location: "/installer/settings" },
  ];

  const newHomeData: SectionData[] = homeData.map((data: SectionData) => ({
    ...data,
    notificationCount:
      notificationCounts[data.sectionName as keyof typeof notificationCounts],
  }));

  return (
    <PageLayout showheaderBadge={false} className="w-full px-2 py-8 md:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 w-full">
        {newHomeData.map((section) => (
          <div
            key={section.sectionName}
            className="group flex flex-col items-center justify-center w-full h-max sm:h-[300px] px-0 py-0 sm:py-0 gap-0 border-[0.4px] border-strokeGreyTwo bg-white hover:border-strokeCream hover:cursor-pointer hover:bg-[#f6f7f8] transition-colors duration-300 ease-in-out relative"
            onClick={() => {
              if (!isMobile) navigate(section.location);
            }}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-[120px] h-[120px] sm:w-[100px] sm:h-[100px] overflow-hidden">
                <img
                  src={section.sectionImage}
                  alt={`${section.sectionName} Icon`}
                  className="w-full h-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
              </div>
              <h2 className="font-secondary font-bold text-base sm:text-xl text-textDarkGrey uppercase">
                {section.sectionName}
              </h2>
            </div>
            {isMobile && (
              <ProceedButton
                type="button"
                onClick={() => navigate(section.location)}
                className="w-12 h-12"
                disabled={false}
              />
            )}
            {!isMobile && (
              <div className="hidden group-hover:block absolute bottom-8 right-8">
                <ProceedButton
                  type="button"
                  onClick={() => navigate(section.location)}
                  className="w-12 h-12"
                  disabled={false}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default AgentHome;
