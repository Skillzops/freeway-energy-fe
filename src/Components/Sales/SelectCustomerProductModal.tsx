import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "../ModalComponent/Modal";
import { useGetRequest } from "@/utils/useApiCall";
import { observer } from "mobx-react-lite";
import { SaleStore } from "@/stores/SaleStore";
import type { TabNamesType } from "../Inventory/InventoryDetailModal";
import type { ListDataType } from "../Products/SelectInventoryModal";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import { TableSearch } from "../TableSearchComponent/TableSearch";
import searchIcon from "../../assets/search.svg";
import ListPagination from "../PaginationComponent/ListPagination";
import TabComponent from "../TabComponent/TabComponent";
import wrong from "../../assets/table/wrong.png";
import { CardComponent } from "../CardComponents/CardComponent";
import CustomerSalesTable from "./CustomerSalesTable";
import { formatNumberWithCommas } from "@/utils/helpers";

interface Customer {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  addressType: "HOME" | "WORK";
  location: string;
  longitude: number | null;
  latitude: number | null;
  status: string;
  type: string;
  creatorId: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const generateListDataEntries = (data: any): ListDataType[] => {
  return data?.updatedResults.map((product: any) => ({
    productId: product?.id,
    productImage: product?.image || "",
    productTag: product?.category?.name,
    productName: product?.name,
    productPrice:
      product?.priceRange?.minimumInventoryBatchPrice ===
      product?.priceRange?.maximumInventoryBatchPrice
        ? `₦ ${formatNumberWithCommas(
            product?.priceRange?.maximumInventoryBatchPrice
          )}`
        : `₦ ${formatNumberWithCommas(
            product?.priceRange?.minimumInventoryBatchPrice
          )} - ${formatNumberWithCommas(
            product?.priceRange?.maximumInventoryBatchPrice
          )}`,
    totalRemainingQuantities: product?.inventories[0]?.totalRemainingQuantities,
    productPaymentModes: product?.paymentModes,
  }));
};

const generateCustomerListDataEntries = (data: any): any[] => {
  return data?.customers.map((item: Customer, index: number) => ({
    sn: index + 1,
    customerId: item?.id || "",
    customerName: `${item?.firstname} ${item?.lastname}`,
    firstname: item?.firstname,
    lastname: item?.lastname,
    location: item?.location || "",
    email: item?.email,
    phone: item?.phone,
  }));
};

const SelectCustomerProductModal = observer(
  ({
    isModalOpen,
    setModalOpen,
    modalType,
  }: {
    isModalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    modalType: "customer" | "product";
  }) => {
    const [queryValue, setQueryValue] = useState<string>("");
    const [productCategoryId, setProductCategoryId] = useState<string>("");
    const [dynamicListData, setDynamicListData] = useState<any[]>([]);
    const [tabContent, setTabContent] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState<number>(12);
    const [_filterValue, setFilterValue] = useState<string>("");

    const fetchAllCustomers = useGetRequest(
      `/v1/customers?page=${currentPage}&limit=${entriesPerPage}${
        queryValue && `&search=${queryValue}`
      }`,
      false
    );
    const fetchAllProductCategories = useGetRequest(
      "/v1/products/categories/all",
      false
    );
    const fetchProductCategoryById = useGetRequest(
      `/v1/products?page=${currentPage}&limit=${entriesPerPage}&categoryId=${_filterValue}${
        queryValue && `&search=${queryValue}`
      }`,
      false
    );
    const fetchedData =
      modalType === "customer" ? fetchAllCustomers : fetchProductCategoryById;

    useEffect(() => {
      if (fetchAllProductCategories?.error) {
        SaleStore.setProductCategoryExist(false);
      } else {
        SaleStore.setProductCategoryExist(true);
      }
    }, [fetchAllProductCategories]);

    useEffect(() => {
      if (fetchAllCustomers?.error) {
        SaleStore.setCustomerExist(false);
      } else {
        SaleStore.setCustomerExist(true);
      }
    }, [fetchAllCustomers]);

    const tabNames: TabNamesType[] = useMemo(() => {
      return (
        fetchAllProductCategories.data?.map((data: { name: any; id: any }) => ({
          name: data.name,
          key: data.name,
          id: data.id,
        })) || []
      );
    }, [fetchAllProductCategories.data]);

    const fetchTabData = useCallback(
      async (categoryId: string) => {
        setFilterValue(categoryId);
        const data = await fetchProductCategoryById.data;
        if (data) {
          return generateListDataEntries(data);
        }
      },
      [fetchProductCategoryById.data]
    );

    // Initialize tabContent with the first tab's key when modal opens
    useEffect(() => {
      if (modalType === "product" && isModalOpen && tabNames.length > 0) {
        const firstTabKey = tabNames[0].key;
        setTabContent(firstTabKey);
        setProductCategoryId(tabNames[0].id);
      }
    }, [isModalOpen, modalType, tabNames]);

    // Fetch data for the selected tab
    useEffect(() => {
      const fetchData = async () => {
        if (productCategoryId) {
          const tabData = await fetchTabData(productCategoryId);
          if (tabData) {
            setDynamicListData((prevListData) => [
              ...prevListData.filter((d) => d.name !== tabContent),
              { name: tabContent, data: tabData },
            ]);
          }
        }
      };
      fetchData();
    }, [fetchTabData, productCategoryId, tabContent]);

    const currentTabData = useMemo(() => {
      return (
        dynamicListData.find((item) => item.name === tabContent)?.data || []
      );
    }, [dynamicListData, tabContent]);

    const paginatedData: [] = useMemo(() => {
      return currentTabData;
    }, [currentTabData]);

    const customerData = generateCustomerListDataEntries(
      fetchAllCustomers?.data
    );

    const paginatedCustomerData = useMemo(() => {
      return customerData || [];
    }, [customerData]);

    const activeTabName =
      tabNames.find((tab) => tab.key === tabContent)?.name || "";

    const handlePageChange = (page: number) => setCurrentPage(page);

    const itemsSelected =
      modalType === "customer"
        ? SaleStore.customer?.customerId
          ? 1
          : 0
        : SaleStore.products.length;

    const handleTabSelect = useCallback(
      (key: string) => {
        setTabContent(key);
        const selectedTab = tabNames.find((tab) => tab.key === key);
        if (selectedTab) {
          setProductCategoryId(selectedTab.id);
          setCurrentPage(1);
        }
      },
      [tabNames]
    );

    return (
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        layout="right"
        size="large"
        bodyStyle="pb-[100px]"
        headerClass="h-[65px]"
        leftHeaderContainerClass="h-full items-start pl-1"
        leftHeaderComponents={
          <h2
            style={{ textShadow: "0.5px 1px grey" }}
            className="text-textBlack text-xl font-semibold font-secondary"
          >
            Select {modalType === "customer" ? "Customer" : "Product"}
          </h2>
        }
        rightHeaderContainerClass="h-full items-start"
      >
        <div className="flex flex-col gap-2 px-4 py-8">
          {modalType === "product" ? (
            <TabComponent
              tabs={tabNames.map(({ name, key }) => ({
                name,
                key,
                count: null,
              }))}
              onTabSelect={handleTabSelect}
              activeTabName={activeTabName}
            />
          ) : null}
          <div className="flex items-center justify-between w-full">
            <ListPagination
              totalItems={fetchedData?.data?.total || 0}
              itemsPerPage={entriesPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              label={activeTabName}
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center bg-[#F9F9F9] px-2 text-textDarkGrey w-max gap-1 h-[24px] border-[0.6px] border-strokeGreyThree rounded-full">
                <p className="flex items-center justify-center text-xs">
                  Item{itemsSelected > 1 ? "s" : ""} Selected
                </p>
                <span className="flex items-center justify-center w-max h-4 px-1 bg-[#EAEEF2] text-xs border-[0.2px] border-strokeGrey rounded-full">
                  {itemsSelected}
                </span>
              </div>
              <button
                disabled={itemsSelected === 0}
                onClick={() => {
                  setModalOpen(false);
                }}
                className={`text-sm  ${
                  itemsSelected > 0
                    ? "bg-primaryGradient text-white"
                    : "bg-[#F6F8FA] text-textDarkGrey cursor-not-allowed"
                } h-[24px] px-4 border-[0.6px] border-strokeGreyTwo rounded-full`}
              >
                Done
              </button>
            </div>
          </div>
          <div className="w-full">
            <TableSearch
              name={"Search"}
              onSearch={(query: string) => {
                setQueryValue(query);
                setCurrentPage(1);
              }}
              queryValue={queryValue}
              setQueryValue={setQueryValue}
              refreshTable={fetchedData.mutate}
              placeholder={`Search ${activeTabName} here`}
              containerClass="w-full"
              inputContainerStyle="w-full"
              inputClass="w-full h-[32px] pl-3 bg-[#F9F9F9]"
              buttonContainerStyle="w-full h-[32px] pl-3 pr-2 bg-white shadow-innerCustom"
              icon={searchIcon}
            />
          </div>
          {/* CONDITIONALLY RENDER THE CUSTOMER AND PRODUCT DATA HERE */}
          {modalType === "product" ? (
            <DataStateWrapper
              isLoading={fetchProductCategoryById?.isLoading}
              error={fetchProductCategoryById?.error}
              errorStates={fetchProductCategoryById?.errorStates}
              refreshData={fetchProductCategoryById?.mutate}
              errorMessage={`Failed to fetch products list for "${activeTabName}".`}
            >
              <div
                className={`flex flex-wrap ${
                  fetchProductCategoryById?.error
                    ? "justify-center"
                    : "justify-start"
                } items-center h-full gap-4`}
              >
                {fetchedData?.data?.total > 0 ? (
                  paginatedData?.map((data: any, index: number) => {
                    return (
                      <CardComponent
                        key={`${data.productId}-${index}`}
                        variant={"inventoryTwo"}
                        isSale={true}
                        productId={data.productId}
                        productImage={data.productImage}
                        productTag={data.productTag}
                        productName={data.productName}
                        productPrice={data.productPrice}
                        productUnits={SaleStore.currentProductUnits(
                          data.productId
                        )}
                        productPaymentModes={data.productPaymentModes}
                        totalRemainingQuantities={data.totalRemainingQuantities}
                        onSelectProduct={(productInfo) => {
                          if (productInfo) SaleStore.addProduct(productInfo);
                          SaleStore.addSaleItem(
                            productInfo.productId as string
                          );
                        }}
                        onRemoveProduct={(productId) => {
                          SaleStore.removeProduct(productId as string);
                          SaleStore.removeSaleItem(productId as string);
                        }}
                        isProductSelected={SaleStore.products.some(
                          (p) => p.productId === data.productId
                        )}
                      />
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full pt-16">
                    <img
                      src={wrong}
                      alt="No data available"
                      className="w-[100px]"
                    />
                    <p className="text-textBlack font-medium">
                      No data available
                    </p>
                  </div>
                )}
              </div>
            </DataStateWrapper>
          ) : (
            <DataStateWrapper
              isLoading={fetchAllCustomers?.isLoading}
              error={fetchAllCustomers?.error}
              errorStates={fetchAllCustomers?.errorStates}
              refreshData={fetchAllCustomers?.mutate}
              errorMessage={`Failed to fetch ${
                modalType === "customer" ? "customers" : "product categories"
              }`}
            >
              <CustomerSalesTable
                customerData={paginatedCustomerData}
                customerSelected={SaleStore.customer}
                onRowClick={(customerInfo) => {
                  if (customerInfo?.customerId)
                    SaleStore.addCustomer(customerInfo);
                }}
                onRemoveCustomer={SaleStore.removeCustomer}
              />
            </DataStateWrapper>
          )}
        </div>
      </Modal>
    );
  }
);

export default SelectCustomerProductModal;
