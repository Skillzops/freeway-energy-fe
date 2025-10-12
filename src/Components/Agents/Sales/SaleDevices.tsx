import producticon from "../../assets/product-grey.svg";

interface Devices {
  id: string;
  serialNumber: string;
  key: string;
  startingCode: string;
  count: string;
  timeDivider: string;
  restrictedDigitMode: boolean;
  hardwareModel: string;
  firmwareVersion: string;
  isTokenable: boolean;
  saleItemIDs: string[];
  createdAt: string;
  updatedAt: string;
}

import { Tag } from "../Products/ProductDetails";

interface DeviceInfoRowProps {
  label: string;
  value: string | number | boolean;
}

const DeviceInfoRow = ({ label, value }: DeviceInfoRowProps) => {
  const formattedValue =
    typeof value === "boolean" ? (value ? "Yes" : "No") : value;

  return (
    <div className="flex items-center justify-between">
      <Tag name={label} />
      <p className="text-xs font-bold text-textDarkGrey">{formattedValue}</p>
    </div>
  );
};

const SaleDevices = ({ data }: { data: Devices[] }) => {
  if (data?.length === 0) return <p>No Devices Selected</p>;
  return (
    <div className="flex flex-col w-full gap-4">
      {data.map((device) => (
        <div
          key={device.id}
          className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]"
        >
          <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
            <img src={producticon} alt="Product Icon" />
            DEVICE - {device.serialNumber.toUpperCase()}
          </p>
          <DeviceInfoRow label="Hardware Model" value={device.hardwareModel} />
          <DeviceInfoRow
            label="Firmware Version"
            value={device.firmwareVersion}
          />
          <DeviceInfoRow label="Tokenable" value={device.isTokenable} />
          <DeviceInfoRow label="Key" value={device.key} />
          <DeviceInfoRow label="Starting Code" value={device.startingCode} />
          <DeviceInfoRow label="Count" value={device.count} />
          <DeviceInfoRow label="Time Divider" value={device.timeDivider} />
          <DeviceInfoRow
            label="Restricted Digit Mode"
            value={device.restrictedDigitMode ? "Enabled" : "Disabled"}
          />
          <DeviceInfoRow
            label="Created At"
            value={new Date(device.createdAt).toLocaleDateString()}
          />
        </div>
      ))}
    </div>
  );
};

export default SaleDevices;
