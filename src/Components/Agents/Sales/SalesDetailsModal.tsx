import React, { useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { ProductTag, SimpleTag } from "../CardComponents/CardComponent";
import TabComponent from "../TabComponent/TabComponent";
import { TabNamesType } from "../Inventory/InventoryDetailModal";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import SaleDetails from "./SaleDetails";
import SaleTransactions from "./SaleTransactions";
import { useGetRequest } from "../../utils/useApiCall";
import SaleDevices from "./SaleDevices";
import SaleInventory from "./SaleInventory";

export type SaleDetailsType = {
  daysToNextInstallment: string;
  status: string;
  productCategory: string;
  paymentMode: string;
  saleId: string;
  productName: string;
  customer: string;
  address: string;
  phone: string;
  email: string;
  lat: string;
  lng: string;
  datetime: string;
  agent: string;
  sale?: any;
  image: string;
  productQuantity: string;
  installmentData: {
    totalPrice: number;
    totalPaid: number;
    totalMonthlyPayment: number;
    installmentStartingPrice: number;
    totalInstallmentDuration: number;
  };
};

export type SaleTransactionsType = {
  transactionId: string;
  transactionRef: string;
  paymentStatus: string;
  datetime: string;
  productCategory: string;
  paymentMode: string;
  amount: number;
};

const SalesDetailsModal = ({
  isOpen,
  setIsOpen,
  salesItemId,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  salesItemId: string;
}) => {
  const [tabContent, setTabContent] = useState<string>("details");

  const fetchSingleSale = useGetRequest(`/v1/agents/sales/${salesItemId}`, true);

  const fetchProductCategories = useGetRequest(
    `/v1/products/categories/all`,
    false
  );
  const generateSaleEntries = (): SaleDetailsType => {
    const data = fetchSingleSale?.data;
    const customerKey = data?.sale?.customer;
    const customerName = `${customerKey?.firstname} ${customerKey?.lastname}`;
    const productCategory =
      fetchProductCategories?.data?.find(
        (item: { id: any }) => item?.id === data?.product?.categoryId
      )?.name || "";

    return {
      daysToNextInstallment: "N/A", // FIX LATER
      status: data?.sale?.status || "",
      productCategory: productCategory || "N/A",
      paymentMode: data?.paymentMode || "",
      saleId: data?.saleId || "",
      productName: data?.product?.name || "",
      customer: customerName,
      address: customerKey?.location || "",
      phone: customerKey?.phone || "",
      email: customerKey?.email || "",
      lat: customerKey?.latitude || "",
      lng: customerKey?.longitude || "",
      datetime: data?.createdAt || "",
      agent: data?.agent || "N/A",
      image: data?.product?.image || "",
      productQuantity: data?.quantity || 0,
      installmentData: {
        totalPrice: data?.sale?.totalPrice || 0,
        totalPaid: data?.sale?.totalPaid || 0,
        totalMonthlyPayment: data?.sale?.totalMonthlyPayment || 0,
        installmentStartingPrice: data?.sale?.installmentStartingPrice || 0,
        totalInstallmentDuration: data?.sale?.totalInstallmentDuration || 0,
      },
      sale: data?.sale,
    };
  };

  const data = generateSaleEntries();

  const generateSaleTransactionEntries = () => {
    const data = fetchSingleSale?.data;
    const entries = data?.sale?.payment.map(
      (p: { id: any; transactionRef: string; paymentStatus: any; paymentDate: any; amount: any }) => ({
        transactionId: p?.id,
        transactionRef: p?.transactionRef,
        paymentStatus: p?.paymentStatus,
        datetime: p?.paymentDate,
        productCategory: data?.sale?.category,
        paymentMode: data?.paymentMode,
        amount: p?.amount,
      })
    );

    const customerKey = data?.sale?.customer;
    const customerName = `${customerKey?.firstname} ${customerKey?.lastname}`;
    const customer = {
      name: customerName,
      phone_number: customerKey?.phone,
      email: customerKey?.email,
      lat: customerKey?.latitude || "",
      lng: customerKey?.longitude || "",
    };
    return { entries, paymentInfo: data?.sale?.payment, customer };
  };

  // Generate saleData for progress bar
  const generateSaleData = () => {
    const saleData = fetchSingleSale?.data;
    const sale = saleData?.sale;
    
    if (!sale) return undefined;
    
    // Calculate total miscellaneous costs from the sale item
    const miscellaneousCost = saleData?.miscellaneousPrices ?
      Object.values(saleData.miscellaneousPrices).reduce((sum: number, cost: any) => sum + (Number(cost) || 0), 0) : 0;
    
    // Calculate the correct total price (should include miscellaneous costs like in SalesSummary)
    const baseTotalPrice = sale.totalPrice || 0;
    const correctTotalPrice = baseTotalPrice;
    
    return {
      totalPrice: correctTotalPrice,
      totalPaid: Math.max(0, sale.totalPaid - (sale.totalMiscellaneousPrice || 0)),
      paymentMode: saleData.paymentMode || "",
      totalInstallments:
        saleData.installmentDuration || sale.totalInstallmentDuration || 0,
      remainingInstallments:
        saleData.remainingInstallments || sale.remainingInstallments || 0,
      paymentsMade:
        sale.payment?.filter((p: any) => p.paymentStatus === "COMPLETED")
          .length || 0,
      miscellaneousCost: miscellaneousCost,
    };
  };

  const tabNames: TabNamesType[] = [
    { name: "Sale Details", key: "details", count: null },
    {
      name: "Sale Inventory",
      key: "inventory",
      count: fetchSingleSale?.data?.product?.inventories?.length || 0,
    },
    {
      name: "Sale Devices",
      key: "devices",
      count: fetchSingleSale?.data?.devices?.length || 0,
    },
    {
      name: "Sale Transactions",
      key: "transactions",
      count: fetchSingleSale?.data?.sale?.payment?.length || 0,
    },
  ];

  return (
    <Modal
      layout="right"
      bodyStyle="pb-44 overflow-auto"
      size="large"
      isOpen={isOpen}
      onClose={() => {
        setTabContent("details");
        setIsOpen(false);
      }}
      leftHeaderComponents={
        data?.status ? (
          <div className="flex items-center gap-3">
            {[data?.daysToNextInstallment, data?.status].map((item, index) =>
              index === 0 &&
              fetchSingleSale?.data.paymentMode === "ONE_OFF" ? null : (
                <SimpleTag
                  key={index}
                  text={item}
                  dotColour="#9BA4BA"
                  containerClass="bg-[#F6F8FA] font-light text-textDarkGrey px-2 py-1 border-[0.4px] border-strokeGreyThree rounded-full"
                />
              )
            )}
          </div>
        ) : null
      }
      leftHeaderContainerClass="pl-2"
    >
      <div className="bg-white">
        <header
          className={`flex items-center ${
            data?.saleId ? "justify-between" : "justify-end"
          } bg-paleGrayGradientLeft p-4 min-h-[64px] border-b-[0.6px] border-b-strokeGreyThree`}
        >
          {!data?.saleId ? null : (
            <div className="flex items-center gap-1 pl-1 pr-2 py-1 w-max bg-[#F6F8FA] border-[0.4px] border-strokeGreyTwo rounded-full">
              <ProductTag productTag={data?.productCategory} />
              <p className="text-textBlack text-xs">{data?.paymentMode}</p>
            </div>
          )}
          {/* {fetchSingleSale?.data?.sale?.status === "COMPLETED" ? null : (
            <DropDown {...dropDownList} />
          )} */}
        </header>
        <div className="flex flex-col w-full gap-4 px-4 py-2">
          <TabComponent
            tabs={tabNames.map(({ name, key, count }) => ({
              name,
              key,
              count,
            }))}
            onTabSelect={(key) => setTabContent(key)}
          />
          <DataStateWrapper
            isLoading={fetchSingleSale?.isLoading}
            error={fetchSingleSale?.error}
            errorStates={fetchSingleSale?.errorStates}
            refreshData={fetchSingleSale?.mutate}
            errorMessage="Failed to fetch sale details"
          >
            {tabContent === "details" ? (
              <SaleDetails data={data} />
            ) : tabContent === "inventory" ? (
              <SaleInventory
                data={fetchSingleSale?.data?.product?.inventories}
              />
            ) : tabContent === "devices" ? (
              <SaleDevices data={fetchSingleSale?.data?.devices} />
            ) : (
              <SaleTransactions
                data={generateSaleTransactionEntries()}
                saleData={generateSaleData()}
                refreshSingleSale={fetchSingleSale?.mutate}
                actualSaleId={fetchSingleSale?.data?.saleId || ""}
              />
            )}
          </DataStateWrapper>
        </div>
      </div>
    </Modal>
  );
};

export default SalesDetailsModal;
