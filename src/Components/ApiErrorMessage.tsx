import { capitalizeFirstLetter } from "@/utils/helpers";
import { ReactNode } from "react";

const ApiErrorMessage = ({
  apiError,
}: {
  apiError: string | string[] | Record<string, unknown> | null;
}): ReactNode => {
  if (
    !apiError ||
    (Array.isArray(apiError) && apiError.length === 0) ||
    (typeof apiError === "object" && Object.keys(apiError).length === 0)
  ) {
    return null;
  }

  return (
    <div className="p-3 mt-4 border border-red-500 rounded-md bg-red-50">
      {typeof apiError === "string" ? (
        <p className="text-sm text-red-600">{apiError}</p>
      ) : Array.isArray(apiError) ? (
        apiError.map((error, index) => (
          <p key={index} className="text-sm text-red-600">
            {error}
          </p>
        ))
      ) : (
        Object.entries(apiError).map(([key, value]) => (
          <p key={key} className="text-sm text-red-600">
            <strong>{capitalizeFirstLetter(key)}:</strong>{" "}
            {Array.isArray(value) ? value.join(", ") : String(value)}
          </p>
        ))
      )}
    </div>
  );
};

export default ApiErrorMessage;
