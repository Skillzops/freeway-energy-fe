import { useState } from "react";
import { PaginationType, Table } from "../TableComponent/Table";
import { CardComponent } from "../CardComponents/CardComponent";
import ProductModal from "./ProductModal";
import { KeyedMutator } from "swr";
import { ApiErrorStatesType } from "../../utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";
import { formatNumberWithCommas } from "@/utils/helpers";

interface AllProductEntries {
  productId: string;
  productImage: string;
  productName: string;
  productTag: string;
  productPrice: {
    minimumInventoryBatchPrice: number;
    maximumInventoryBatchPrice: number;
  };
}

// Helper function to map the API data to the ProductEntries format
const generateProductEntries = (data: any): AllProductEntries[] => {
  const entries: AllProductEntries[] = data?.updatedResults?.map(
    (product: any) => {
      return {
        productId: product?.id,
        productImage: product?.image,
        productName: product.name,
        productTag: product?.category?.name,
        productPrice: product?.priceRange,
      };
    }
  );

  return entries;
};

const ProductsTable = ({
  productData,
  isLoading,
  refreshTable,
  error,
  errorData,
  paginationInfo,
  setTableQueryParams,
}: {
  productData: any;
  isLoading: boolean;
  refreshTable: KeyedMutator<any>;
  error: any;
  errorData: ApiErrorStatesType;
  paginationInfo: PaginationType;
  setTableQueryParams: React.Dispatch<
    React.SetStateAction<Record<string, any> | null>
  >;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [productId, setProductId] = useState<string>("");
  const [queryValue, setQueryValue] = useState<string>("");
  const [isSearchQuery, setIsSearchQuery] = useState<boolean>(false);

  const filterList = [
    // {
    //   name: "All Products",
    //   items: ["SHS", "EAAS", "Rootop"],
    //   onClickLink: (index: number) => {
    //     console.log("INDEX:", index);
    //   },
    // },
    {
      name: "Search",
      onSearch: async (query: string) => {
        setQueryValue(query);
        setIsSearchQuery(true);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          search: query,
        }));
      },
      isSearch: true,
    },
    {
      onDateClick: (date: string) => {
        setQueryValue(date);
        setIsSearchQuery(false);
        setTableQueryParams((prevParams) => ({
          ...prevParams,
          createdAt: date.split("T")[0],
        }));
      },
      isDate: true,
    },
  ];

  const dropDownList = {
    items: ["View Product", "Cancel Product"],
    onClickLink: (index: number, cardData: any) => {
      switch (index) {
        case 0:
          setProductId(cardData?.productId);
          setIsOpen(true);
          break;
        case 1:
          console.log("Cancel product");
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  const getTableData = () => {
    return generateProductEntries(productData);
  };

  return (
    <>
      {!error ? (
        <div className="w-full">
          <Table
            tableType="card"
            tableTitle="ALL PRODUCTS"
            tableClassname="flex flex-wrap items-center gap-4"
            tableData={getTableData()}
            loading={isLoading}
            filterList={filterList}
            cardComponent={(data) => {
              return data?.map((item: AllProductEntries, index) => {
                const {
                  minimumInventoryBatchPrice,
                  maximumInventoryBatchPrice,
                } = item.productPrice;
                const formattedPrice =
                  minimumInventoryBatchPrice === maximumInventoryBatchPrice
                    ? `₦ ${formatNumberWithCommas(maximumInventoryBatchPrice)}`
                    : `₦ ${formatNumberWithCommas(
                        minimumInventoryBatchPrice
                      )} - ${formatNumberWithCommas(
                        maximumInventoryBatchPrice
                      )}`;

                return (
                  <CardComponent
                    key={index}
                    variant="product-no-image"
                    productId={item.productId}
                    productImage={item.productImage}
                    productName={item.productName}
                    productTag={item.productTag}
                    productPrice={formattedPrice}
                    dropDownList={dropDownList}
                  />
                );
              });
            }}
            refreshTable={async () => {
              await refreshTable();
            }}
            queryValue={isSearchQuery ? queryValue : ""}
            paginationInfo={paginationInfo}
            clearFilters={() => setTableQueryParams({})}
          />
          {productId && (
            <ProductModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              productID={productId}
              refreshTable={refreshTable}
            />
          )}
        </div>
      ) : (
        <ErrorComponent
          message="Failed to fetch product list."
          className="rounded-[20px]"
          refreshData={refreshTable}
          errorData={errorData}
        />
      )}
    </>
  );
};

export default ProductsTable;
