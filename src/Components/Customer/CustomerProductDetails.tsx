import { useMemo } from "react";

type ProductRow = {
  id: string;
  serial: string;
  keyValue: string;
  tokenCount: number;
  statusText: string;
};

const toArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  return [];
};

const asText = (value: any, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

const readTokenCount = (item: any): number => {
  const candidates = [
    item?.tokenCount,
    item?.tokensCount,
    item?.totalTokens,
    item?.device?.tokenCount,
    item?.device?.tokensCount,
    toArray(item?.tokens).length,
    toArray(item?.device?.tokens).length,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
    if (typeof candidate === "string" && candidate.trim() !== "") {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return 0;
};

const mapProductItem = (item: any, index: number): ProductRow => {
  const serial =
    item?.serialNumber ||
    item?.serial ||
    item?.deviceSerial ||
    item?.device?.serialNumber ||
    item?.device?.serial ||
    item?.saleDevice?.serialNumber ||
    "N/A";

  const keyValue =
    item?.key ||
    item?.publicKey ||
    item?.device?.key ||
    item?.device?.publicKey ||
    item?.saleDevice?.key ||
    "N/A";

  const statusText =
    item?.status ||
    item?.installationStatus ||
    (item?.isActive === true ? "ACTIVE" : item?.isActive === false ? "INACTIVE" : "N/A");

  return {
    id: asText(item?.id || item?._id || item?.deviceId || item?.device?.id || index),
    serial: asText(serial),
    keyValue: asText(keyValue),
    tokenCount: readTokenCount(item),
    statusText: asText(statusText, "N/A"),
  };
};

const extractProductRows = (customer: any): ProductRow[] => {
  const primarySources = [
    ...toArray(customer?.products),
    ...toArray(customer?.productDetails),
    ...toArray(customer?.devices),
    ...toArray(customer?.customerDetails?.products),
    ...toArray(customer?.customerDetails?.devices),
    ...toArray(customer?.assignedDevices),
    ...toArray(customer?.assignedProducts),
  ];

  const sales = toArray(customer?.sales);
  const saleDerived = sales.flatMap((sale: any) => [
    ...toArray(sale?.devices),
    ...toArray(sale?.saleDevices),
    ...toArray(sale?.saleItems),
  ]);

  const items = [...primarySources, ...saleDerived];

  if (items.length === 0) return [];

  const rows = items.map(mapProductItem).filter((row) => row.serial !== "N/A");

  const deduped = new Map<string, ProductRow>();
  rows.forEach((row) => {
    if (!deduped.has(row.serial)) deduped.set(row.serial, row);
  });

  return Array.from(deduped.values());
};

const CustomerProductDetails = ({ customer }: { customer: any }) => {
  const rows = useMemo(() => extractProductRows(customer), [customer]);

  if (rows.length === 0) {
    return (
      <div className="w-full p-3 border-[0.6px] border-strokeGreyThree rounded-[20px] bg-white">
        <p className="text-textLightGrey text-xs">No product details found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-2.5">
      {rows.map((row) => (
        <div
          key={row.id}
          className="w-full rounded-[20px] border-[0.6px] border-strokeGreyThree bg-white p-3"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-[11px] font-medium text-textLightGrey uppercase">SERIAL</p>
              <p className="text-[16px] leading-[1.2] font-semibold text-textBlack tracking-tight truncate max-w-full">
                {row.serial}
              </p>
            </div>
            <span className="flex items-center justify-center min-w-[44px] h-[24px] rounded-full border-[0.6px] border-strokeGreyThree bg-[#F6F8FA] text-textLightGrey text-sm font-semibold">
              • -
            </span>
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-2 items-center">
            <p className="text-xs font-medium text-textBlack">Tokens: {row.tokenCount}</p>
            <p className="text-xs font-medium text-textLightGrey text-right truncate">
              Key: {row.keyValue}
            </p>
          </div>
          {row.statusText !== "N/A" ? (
            <p className="mt-1 text-[10px] font-medium text-textLightGrey uppercase text-right">
              {row.statusText}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default CustomerProductDetails;
