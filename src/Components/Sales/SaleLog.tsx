import { DateTimeTag, SimpleTag } from "../CardComponents/CardComponent";

type SaleLogItem = {
  id?: string;
  _id?: string;
  action?: string;
  method?: string;
  createdAt?: string;
  timestamp?: string;
  description?: string;
  message?: string;
  entity?: string;
  route?: string;
  path?: string;
  endpoint?: string;
  requestUrl?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: Record<string, any>;
};

const formatValues = (val: any) => {
  if (!val || typeof val !== "object" || Object.keys(val).length === 0) {
    return "none";
  }
  return JSON.stringify(val);
};

const SaleLog = ({ logs }: { logs: SaleLogItem[] }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="border border-strokeGreyThree rounded-[20px] p-4 text-textLightGrey text-[14px] bg-[#F9FAFB]">
        No sale logs found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {logs.map((log, idx) => (
        <div
          key={log.id || log._id || idx}
          className="border border-strokeGreyThree rounded-[20px] p-4 bg-white flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-2">
            <SimpleTag
              text={log.action || log.method || "N/A"}
              dotColour="#9BA4BA"
              containerClass="bg-[#F6F8FA] font-semibold text-textDarkGrey px-2 py-1 border-[0.4px] border-strokeGreyThree rounded-full"
            />
            {log.createdAt || log.timestamp ? (
              <DateTimeTag datetime={log.createdAt || log.timestamp || ""} showAll={false} />
            ) : null}
          </div>

          <p className="text-textDarkGrey text-sm">
            {log.description ||
              log.message ||
              log.entity ||
              log.route ||
              log.path ||
              log.endpoint ||
              "No description"}
          </p>

          <p className="text-textGrey text-xs leading-snug">
            Old Values: {formatValues(log.oldValues)} | New Values: {formatValues(log.newValues)} |
            Changes: {formatValues(log.changes)}
          </p>

          {log.requestUrl ? (
            <p className="text-textGrey text-xs">URL: {log.requestUrl}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default SaleLog;
