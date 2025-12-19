import { Tag } from "@/Components/Products/ProductDetails";
import producticon from "@/assets/product-grey.svg";
import React from "react";
import { FiCopy } from "react-icons/fi";


interface Token {
  id: string;
  token: string;
  duration: number;
  tokenReleased: boolean;
  createdAt: string;
  deviceId: string;
  creatorId: string | null;
}

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
  tokens?: Token[];
  installationLocation: string;
  installationLongitude: string;
  installationLatitude: string;
}

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

const TokensGroup = ({ devices }: { devices: Devices[] }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const devicesWithTokens = (devices ?? []).filter(d => (d.tokens?.length || 0) > 0);
  const totalTokens =
    devicesWithTokens.reduce((acc, d) => acc + (d.tokens?.length || 0), 0);

  const handleCopy = async (id: string, value: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement("textarea");
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      setCopiedId(null);
    }
  };

  if (devicesWithTokens.length === 0) return null;

  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold text-textDarkGrey mb-2">
        Device Tokens
        <span className="ml-2 text-[11px] font-medium text-textLightGrey">({totalTokens})</span>
      </h3>

      <div className="flex flex-col gap-3">
        {devicesWithTokens.map((device) => {
          const tokensSorted = [...(device.tokens || [])].sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          });

          return (
            <div key={device.id} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-textGrey">
                  {device.serialNumber?.toUpperCase?.() || device.serialNumber}
                </span>
                <span className="text-[10px] text-textLightGrey">
                  {tokensSorted.length} token{tokensSorted.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="rounded-xl border border-strokeGreyThree bg-white overflow-hidden">
                {tokensSorted.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`grid grid-cols-3 items-center gap-2 px-2.5 py-1.5 text-[11px] ${idx !== tokensSorted.length - 1 ? "border-b border-strokeGreyThree" : ""
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tracking-wide font-mono">
                        {t.token}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(t.id, t.token)}
                        className="inline-flex items-center justify-center rounded-md border border-strokeGreyThree hover:bg-gray-50 transition px-1.5 py-1"
                        title="Copy token"
                        aria-label={`Copy token ${t.token}`}
                      >
                        <FiCopy className="text-[14px]" />
                      </button>
                      {copiedId === t.id && (
                        <span className="text-[10px] text-green-600">Copied!</span>
                      )}
                    </div>

                    <span>
                      {typeof t.duration === "number"
                        ? (t.duration > 0 ? `${t.duration} days` : t.duration === 0 ? "0 days" : `${t.duration}`)
                        : "—"}
                    </span>

                    <span className="text-right">
                      {t.tokenReleased ? "Released" : "Pending"}
                      {t.createdAt ? ` • ${new Date(t.createdAt).toLocaleString()}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const SaleDevices = ({ data }: { data: Devices[] }) => {
  if (!data || data.length === 0) return <p>No Devices Selected</p>;

  return (
    <div className="flex flex-col w-full gap-4">
      {data.map((device) => (
        <div
          key={device.id}
          className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]"
        >
          <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
            <img src={producticon} alt="Product Icon" />
            DEVICE - {device.serialNumber?.toUpperCase?.() || device.serialNumber}
          </p>
          <DeviceInfoRow label="Hardware Model" value={device.hardwareModel} />
          <DeviceInfoRow label="Firmware Version" value={device.firmwareVersion} />
          <DeviceInfoRow label="Tokenable" value={device.isTokenable} />
          <DeviceInfoRow label="Key" value={device.key} />
          <DeviceInfoRow label="Starting Code" value={device.startingCode} />
          <DeviceInfoRow label="Count" value={device.count} />
          <DeviceInfoRow label="Time Divider" value={device.timeDivider} />
          <DeviceInfoRow label="Installation Location" value={device.installationLocation ?? "N/A"} />
          <DeviceInfoRow label="Installation Longitude" value={device.installationLongitude ?? "N/A"} />
          <DeviceInfoRow label="Installation Latitude" value={device.installationLatitude ?? "N/A"} />

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

      <TokensGroup devices={data} />
    </div>
  );
};

export default SaleDevices;

