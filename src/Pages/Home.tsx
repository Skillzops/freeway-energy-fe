import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import sales from "@/assets/home/sales.svg";
// import transactions from "@/assets/home/transactions.svg";
import customers from "@/assets/home/customers.svg";
import agents from "@/assets/home/agents.svg";
import products from "@/assets/home/products.svg";
import inventory from "@/assets/home/inventory.svg";
import contracts from "@/assets/home/contracts.svg";
// import support from "@/assets/home/support.svg";
// import communication from "@/assets/home/communication.svg";
import settings from "@/assets/home/settings.svg";
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
    { sectionName: "Sales", sectionImage: sales, location: "/sales" },
    // {
    //   sectionName: "Transactions",
    //   sectionImage: transactions,
    //   location: "/transactions",
    // },
    {
      sectionName: "Customers",
      sectionImage: customers,
      location: "/customers",
    },
    { sectionName: "Agents", sectionImage: agents, location: "/agents" },
    { sectionName: "Products", sectionImage: products, location: "/products" },
    {
      sectionName: "Inventory",
      sectionImage: inventory,
      location: "/inventory",
    },
    {
      sectionName: "Devices",
      sectionImage: inventory,
      location: "/devices",
    },
    {
      sectionName: "Contracts",
      sectionImage: contracts,
      location: "/contracts",
    },
    // { sectionName: "Support", sectionImage: support, location: "/support" },
    // {
    //   sectionName: "Communication",
    //   sectionImage: communication,
    //   location: "/communication",
    // },
    { sectionName: "Settings", sectionImage: settings, location: "/settings" },
  ];

  const newHomeData: SectionData[] = homeData.map((data: SectionData) => ({
    ...data,
    notificationCount:
      notificationCounts[data.sectionName as keyof typeof notificationCounts],
  }));

  return (
    <PageLayout showheaderBadge={false} className="w-full px-2 py-8 md:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 place-items-center">
        {newHomeData.map((section) => (
          <div
            key={section.sectionName}
            className="group flex flex-col items-center justify-between sm:justify-normal w-full max-w-[450px] h-max sm:h-[350px] px-[10px] py-[25px] sm:py-[20px] gap-2.5 border-[0.4px] border-strokeGreyTwo bg-white hover:border-strokeCream hover:cursor-pointer hover:bg-[#f6f7f8] transition-colors duration-300 ease-in-out"
            onClick={() => {
              if (!isMobile) navigate(section.location);
            }}
          >
            {/* {section?.notificationCount && section.notificationCount > 0 ? (
              <div
                className={`flex items-center justify-center ${
                  section?.notificationCount >= 10 ? "bg-grape" : "bg-[#FDEEC2]"
                } w-max h-[24px] pl-3 pr-0.5 gap-2 text-textDarkGrey text-[11px] font-medium md:font-normal rounded-full`}
              >
                Your attention is needed
                <span className="flex items-center justify-center w-[20px] h-[20px] bg-chalk shadow-innerCustom text-xs font-medium text-primary rounded-full">
                  {section.notificationCount}
                </span>
              </div>
            ) : (
              )} */}
            <div className="sm:h-[24px]"></div>
            <div className="flex flex-col items-center justify-center pb-4 sm:p-0">
              <div className="w-[143px] h-[143px] sm:w-[128px] sm:h-[128px] overflow-hidden">
                <img
                  src={section.sectionImage}
                  alt={`${section.sectionName} Icon`}
                  className="w-full h-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
              </div>
              <h2 className="font-secondary font-bold text-lg sm:text-2xl text-textDarkGrey uppercase">
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
