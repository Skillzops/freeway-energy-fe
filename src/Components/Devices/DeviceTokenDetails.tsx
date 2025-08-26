import { KeyedMutator } from "swr";
import { DeviceEntries, TokenEntry } from "./DevicesTable";
import { useApiCall } from "@/utils/useApiCall";
import { useState } from "react";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { SmallInput } from "../InputComponent/Input";
import ApiErrorMessage from "../ApiErrorMessage";
import { BiTrash } from "react-icons/bi";

const DeviceTokenDetails = ({
  deviceData,
  refreshTable,
  refreshListView,
}: {
  deviceData: DeviceEntries;
  refreshTable: KeyedMutator<any>;
  refreshListView: KeyedMutator<any>;
}) => {
  const { apiCall } = useApiCall();
  const tokens: TokenEntry[] = deviceData.tokens || [];
  const [generatingToken, setGeneratingToken] = useState(false);
  const [tokenDuration, setTokenDuration] = useState<string>("30");
  const [apiError, setApiError] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<TokenEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  console.log({ tokens });
  const generateNewToken = async () => {
    if (!deviceData.isTokenable) {
      setApiError(
        "This device is not tokenable. Please enable tokenable status first."
      );
      return;
    }

    const duration = parseInt(tokenDuration);

    if (isNaN(duration)) {
      setApiError("Please enter a valid number for token duration");
      return;
    }

    setGeneratingToken(true);
    setApiError("");

    try {
      await apiCall({
        endpoint: `/v1/device/${deviceData.id}/generate-token`,
        method: "post",
        data: { tokenDuration: duration },
        successMessage: "Token generated successfully!",
      });

      await refreshTable();
      await refreshListView();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to generate token";
      setApiError(message);
    } finally {
      setGeneratingToken(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDurationText = (duration: number) => {
    return duration === -1 ? "Forever" : `${duration} days`;
  };

  const copyToClipboard = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      // You might want to add a toast notification here
    } catch (error) {
      console.error("Failed to copy token:", error);
    }
  };

  const handleDeleteToken = async () => {
    if (!tokenToDelete) return;

    setDeleting(true);
    setApiError("");

    try {
      await apiCall({
        endpoint: `/v1/device/${deviceData.id}/token/${tokenToDelete.id}`,
        method: "post", // your backend expects POST
        successMessage: "Token deleted successfully!",
      });

      await refreshTable();
      await refreshListView();
      setShowDeleteModal(false);
      setTokenToDelete(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to delete token";
      setApiError(message);
    } finally {
      setDeleting(false);
    }
  };
  

  return (
    <div className="space-y-4">
      {/* Token Generation Section */}
      <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-4">
        <h3 className="text-sm font-medium text-textDarkGrey mb-4">
          Generate New Token
        </h3>

        {!deviceData.isTokenable && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ This device is not tokenable. Enable tokenable status in the
              device details to generate tokens.
            </p>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-textDarkGrey mb-1">
              Token Duration (days)
            </label>
            <SmallInput
              type="text"
              name="duration"
              value={tokenDuration}
              onChange={(e) => setTokenDuration(e.target.value)}
              placeholder="Duration in days"
              disabled={!deviceData.isTokenable}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter -1 for forever token
            </p>
          </div>

          <div className="flex-shrink-0 pt-5">
            <ProceedButton
              type="submit"
              variant={deviceData.isTokenable ? "gradient" : "gray"}
              loading={generatingToken}
              disabled={!deviceData.isTokenable || generatingToken}
              onClick={generateNewToken}
            />
          </div>
        </div>

        <ApiErrorMessage apiError={apiError} />
      </div>

      {/* Tokens List */}
      <div className="bg-white border-[0.6px] border-strokeGreyThree rounded-[20px] p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-textDarkGrey">
            Generated Tokens
          </h3>
          <span className="text-xs text-gray-500">
            {tokens.length} token{tokens.length !== 1 ? "s" : ""} generated
          </span>
        </div>

        {tokens.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No tokens generated yet</p>
            <p className="text-xs mt-1">Generate your first token above</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tokens.map((token, index) => (
              <div
                key={token.id}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Token #{tokens.length - index}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getDurationText(token.duration)}
                        </span>
                      </div>
                      <BiTrash
                        onClick={() => {
                          setTokenToDelete(token);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-400 hover:scale-105 cursor-pointer text-xl"
                      />
                    </div>

                    <div className="bg-gray-100 rounded p-2 mb-2">
                      <code className="text-sm font-mono text-gray-800 break-all">
                        {token.token}
                      </code>
                    </div>

                    <p className="text-xs text-gray-500">
                      Generated: {formatDate(token.createdAt)}
                    </p>
                    <p className="text-xs font-bold text-gray-500 ">
                      Created by:{" "}
                      {token?.creator ? (
                        <span className="uppercase">
                          {token?.creator?.firstname} {token?.creator?.lastname}{" "}
                          ({token?.creator?.role.role})
                        </span>
                      ) : (
                        "Unknown User"
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(token.token)}
                    className="ml-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy token"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this token? This action cannot
                be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  onClick={handleDeleteToken}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceTokenDetails;
