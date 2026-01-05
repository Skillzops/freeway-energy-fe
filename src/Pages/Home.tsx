import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import { brandAssets } from "@/config/brandConfig";

import useBreakpoint from "@/hooks/useBreakpoint";
import ProceedButton from "@/Components/ProceedButtonComponent/ProceedButtonComponent";

type SectionData = {
  sectionName: string;
  notificationCount?: number;
  sectionImage: string;
  location: string;
};

const Home = () => {
  const navigate = useNavigate();
  const isMobile = useBreakpoint("max", 640);

  const notificationCounts = {
    Sales: 3,
    Transactions: 1,
    Customers: 2,
    Agents: 0,
    Products: 10,
    Inventory: 15,
    Devices: 10,
    Contracts: 2,
    Support: 3,
    Communication: 4,
    Settings: 0,
  };

  const homeData = [
    {
      sectionName: "Dashboard",
      sectionImage: brandAssets.homeIcons.dashboard,
      location: "/dashboard",
    },
    {
      sectionName: "Sales",
      sectionImage: brandAssets.homeIcons.sales,
      location: "/sales",
    },
    // { sectionName: "Transactions", sectionImage: transactions, location: "/transactions" },
    {
      sectionName: "Customers",
      sectionImage: brandAssets.homeIcons.customers,
      location: "/customers",
    },
    {
      sectionName: "Agents",
      sectionImage: brandAssets.homeIcons.agents,
      location: "/agents",
    },
    {
      sectionName: "Products",
      sectionImage: brandAssets.homeIcons.products,
      location: "/products",
    },
    {
      sectionName: "Inventory",
      sectionImage: brandAssets.homeIcons.inventory,
      location: "/inventory",
    },
    {
      sectionName: "Devices",
      sectionImage: brandAssets.homeIcons.devices,
      location: "/devices",
    },
    {
      sectionName: "Contracts",
      sectionImage: brandAssets.homeIcons.contracts,
      location: "/contracts",
    },
    {
      sectionName: "Reports",
      sectionImage: brandAssets.homeIcons.reports,
      location: "/reports",
    },
    // { sectionName: "Support", sectionImage: support, location: "/support" },
    // { sectionName: "Communication", sectionImage: communication, location: "/communication" },
    {
      sectionName: "Settings",
      sectionImage: brandAssets.homeIcons.settings,
      location: "/settings",
    },
  ];

  const newHomeData: SectionData[] = homeData.map((data: SectionData) => ({
    ...data,
    notificationCount:
      notificationCounts[data.sectionName as keyof typeof notificationCounts],
  }));

  return (
    <PageLayout showheaderBadge={false} className="w-full px-2 py-8 md:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
        {newHomeData.map((section) => (
          <div
            key={section.sectionName}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !isMobile) {
                e.preventDefault();
                navigate(section.location);
              }
            }}
            className="
              group relative rounded-2xl flex flex-col items-center justify-center 
              w-full max-w-[450px] h-max sm:h-[350px] px-[10px] py-[25px] sm:py-[20px] gap-2.5
              border border-strokeGreyTwo bg-white
              transition-all duration-300 ease-out
              hover:-translate-y-[2px] hover:shadow-[0_14px_30px_rgba(0,0,0,0.12)]
              hover:bg-[var(--brand-primary)] hover:border-[var(--brand-primary)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/50
            "
            onClick={() => {
              if (!isMobile) navigate(section.location);
            }}
          >
            <div />
            <div className="flex flex-col items-center justify-center pb-4 sm:p-0 text-textDarkGrey group-hover:text-white transition-colors duration-300">
              <div className="w-[113px] h-[113px] sm:w-[98px] sm:h-[98px] overflow-hidden">
                <div
                  className="
                    w-full h-full transition-transform duration-300 ease-out transition-colors
                    group-hover:scale-110
                    bg-[var(--brand-primary)] group-hover:bg-white
                  "
                  style={{
                    maskImage: `url(${section.sectionImage})`,
                    WebkitMaskImage: `url(${section.sectionImage})`,
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                  }}
                  aria-label={`${section.sectionName} Icon`}
                />

                {/* <div
                  className="w-36 h-24 opacity-20"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                    maskImage: `url(${section.sectionImage})`,
                    WebkitMaskImage: `url(${section.sectionImage})`,
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "right center",
                    WebkitMaskPosition: "right center",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                  }}
                  aria-label={`${section.sectionName} Icon`}
                  role="img"
                /> */}
              </div>

              <h2 className="mt-6 font-secondary font-bold text-lg sm:text-2xl uppercase transition-colors duration-300">
                {section.sectionName}
              </h2>
            </div>

            {isMobile && (
              <ProceedButton
                type="button"
                onClick={() => navigate(section.location)}
                className="w-14 h-14"
                disabled={false}
              />
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default Home;
