import { useState } from "react";
import { Link } from "react-router-dom";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { KeyedMutator } from "swr";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { BRAND_CONFIG, brandAssets } from "@/config/brandConfig";

export default function ErrorPage({
  error,
  resetErrorBoundary,
}: {
  error: {
    title?: string;
    message?: string;
    statusCode?: number;
    isNetworkError?: boolean;
  };
  resetErrorBoundary: () => void;
}) {
  const networkError = error?.isNetworkError === true;
  const statusCode = error?.statusCode || 500;
  const title = error?.title || "Internal Server Error";
  const message = networkError
    ? "No Internet Connection, Try checking your network configuration."
    : "Sorry, something went wrong on our end. We're working to fix it.";
  const supportEmail = BRAND_CONFIG.supportEmail;
  const supportEmailHref = `mailto:${supportEmail}`;
  const brandLogo = brandAssets.logoFull;
  const brandBg = brandAssets.authBackgrounds.default;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden px-4 py-16">
      <img
        src={brandBg}
        alt="background"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
      />
      <img src={brandLogo} alt="Logo" className="z-10 w-[120px]" />
      <div className="z-10 w-full max-w-md rounded-[32px] bg-white/55 px-6 py-10 text-center shadow-[0_24px_80px_rgba(24,121,197,0.14)] backdrop-blur-[10px] sm:px-8">
        <div className="text-center">
            <div className="relative">
              <svg height="0" width="0">
                <defs>
                  <linearGradient
                    id="errorGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      style={{
                        stopColor: "var(--brand-primary)",
                        stopOpacity: 1,
                      }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#473b15", stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
              </svg>

              <TbAlertTriangleFilled
                className="mx-auto h-20 w-20"
                style={{
                  fill: "url(#errorGradient)",
                }}
              />
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#12385E] sm:text-5xl">
              {statusCode}
            </h1>
            <h2 className="mt-2 text-3xl font-semibold text-[#174A74]">
              {title}
            </h2>
            <p className="mt-2 text-lg text-[#4D7097]">{message}</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mt-6">
              {!networkError && (
                <Link
                  to={"/home"}
                  className="inline-flex items-center px-5 py-2 text-base font-medium rounded-md text-white bg-errorGradient hover:bg-inversedErrorGradient transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={resetErrorBoundary}
                >
                  Go back home
                </Link>
              )}
              <div
                className="inline-flex items-center px-5 py-2 text-base font-medium rounded-md text-white bg-errorGradient hover:bg-inversedErrorGradient transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
                onClick={() => {
                  resetErrorBoundary();
                  window.location.reload();
                }}
              >
                Refresh
              </div>
            </div>
            {!networkError && (
              <p className="mt-4 text-[15px] text-[#4D7097]">
                If this problem persists, please contact our support team by
                sending an email to{" "}
                <a
                  href={supportEmailHref}
                  className="text-primary hover:underline"
                >
                  {supportEmail}
                </a>
                .
              </p>
            )}
        </div>
      </div>
    </main>
  );
}

export const ErrorComponent = ({
  message,
  className,
  refreshData,
  errorData,
}: {
  message: string;
  className?: string;
  refreshData?: KeyedMutator<any>;
  errorData: ApiErrorStatesType;
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleRefetch = async () => {
    // Don't allow refetch for permission errors
    if (errorData?.isPermissionError) return;

    setLoading(true);
    try {
      if (refreshData) {
        await refreshData();
      } else {
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine error messages based on error type
  const getMainMessage = () => {
    if (errorData?.isPermissionError) {
      return "Access Denied";
    }
    if (errorData?.isNetworkError) {
      return "No Internet Connection";
    }
    return "Something Went Wrong";
  };

  const getSecondaryMessage = () => {
    if (errorData?.isPermissionError) {
      return "Your current permissions don't allow access to this resource.";
    }
    if (errorData?.isNetworkError) {
      return "Try checking your network configuration.";
    }
    return message;
  };

  const getActionMessage = () => {
    if (errorData?.isPermissionError) {
      return "Please contact your administrator to request access.";
    }
    return null;
  };

  return (
    <div
      className={`flex flex-col items-center justify-center w-full h-full py-12 px-4 bg-gray-100 ${className}`}
    >
      <TbAlertTriangleFilled className="mx-auto h-16 w-16 text-primary" />

      <p className="mt-2 text-base sm:text-lg text-primary text-center font-semibold sm:max-w-[65%]">
        {getMainMessage()}
      </p>

      <p className="text-sm text-textBlack text-center">
        {getSecondaryMessage()}
      </p>

      {getActionMessage() && (
        <p className="text-sm text-textBlack text-center">
          {getActionMessage()}
        </p>
      )}

      {/* Only show retry button for non-permission errors */}
      {!errorData?.isPermissionError && (
        <button
          onClick={handleRefetch}
          disabled={loading}
          className="mt-6 px-5 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
        >
          {loading ? "Retrying..." : "Try Again"}
        </button>
      )}
    </div>
  );
};
