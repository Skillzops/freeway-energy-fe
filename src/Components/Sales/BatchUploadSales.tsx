// BatchUploadSales.tsx
import { useApiCall } from "@/utils/useApiCall";
import React, { useEffect, useState } from "react";
import { KeyedMutator } from "swr";
import { z } from "zod";
import { Modal } from "../ModalComponent/Modal";
import { FileInput } from "../InputComponent/Input";
import ApiErrorMessage from "../ApiErrorMessage";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { RxFilePlus } from "react-icons/rx";
import { toast } from "react-toastify";

const FileFormSchema = z.object({
  salesFile: z
    .instanceof(File, { message: "Sales file is required" })
    .refine(
      (file) =>
        ["csv", "xlsx", "xls"].includes(
          file.name.split(".").pop()?.toLowerCase() || ""
        ),
      { message: "Only CSV/Excel files (.csv, .xlsx, .xls) allowed" }
    ),
});

interface BatchUploadSalesProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allSalesRefresh: KeyedMutator<any>;
}

const BatchUploadSales: React.FC<BatchUploadSalesProps> = ({
  isOpen,
  setIsOpen,
  allSalesRefresh,
}) => {
  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const result = FileFormSchema.safeParse({ salesFile: selectedFile });

      if (!result.success) {
        setFormErrors(result.error.issues);
      } else {
        setFormErrors([]);
        setFile(selectedFile);
      }
    }
    setApiError("");
  };

  const [uploadProgress, setUploadProgress] = useState<{
    sessionId: string | null;
    progress: number;
    status: string;
    isPolling: boolean;
  }>({
    sessionId: null,
    progress: 0,
    status: "",
    isPolling: false,
  });

  const pollUploadProgress = async (sessionId: string) => {
    setUploadProgress((prev) => ({ ...prev, isPolling: true }));

    const pollInterval = setInterval(async () => {
      try {
        const response = await apiCall({
          endpoint: `v1/csv-upload/get-upload-stats`,
          method: "post",
          data: { sessionId },
          showToast: false,
        });

        const statsData = response.data || response;

        setUploadProgress((prev) => ({
          ...prev,
          progress: statsData.progressPercentage || 0,
          status: statsData.status || "processing",
        }));

        if (
          statsData.status === "completed" ||
          statsData.status === "failed" ||
          statsData.status === "cancelled"
        ) {
          clearInterval(pollInterval);
          setUploadProgress((prev) => ({ ...prev, isPolling: false }));

          if (statsData.status === "completed") {
            await allSalesRefresh();
            //   setIsOpen(false);
            toast.success("Upload Completed Successfully!");
            setFile(null);
            setUploadProgress({
              sessionId: null,
              progress: 0,
              status: "",
              isPolling: false,
            });
          } else if (statsData.status === "failed") {
            setApiError(
              `Upload failed. ${statsData.errorRecords || 0} errors occurred.`
            );
          }
        }
      } catch (error) {
        console.error("Error polling progress:", error);
        clearInterval(pollInterval);
        setUploadProgress((prev) => ({ ...prev, isPolling: false }));
        setApiError("Failed to get upload progress");
      }
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError(""); // Clear previous errors

    try {
      if (!file) {
        throw new Error("Sales file is required");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await apiCall({
        endpoint: "v1/csv-upload/process",
        method: "post",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        successMessage: "Sales upload started successfully!",
      });

      const sessionId = response.data?.sessionId || response.sessionId;

      if (!sessionId) {
        console.error("Full response:", response);
        throw new Error("No session ID received from server");
      }

      setUploadProgress({
        sessionId: sessionId,
        progress: 0,
        status: "processing",
        isPolling: true,
      });

      await pollUploadProgress(sessionId);
    } catch (error: any) {
      console.error("Upload error:", error);

      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Sales Upload Failed: Internal Server Error";
        setApiError(message);
      }

      setUploadProgress({
        sessionId: null,
        progress: 0,
        status: "",
        isPolling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (uploadProgress.isPolling) {
        e.preventDefault();
        e.returnValue = "Upload in progress. Are you sure you want to leave?";
        return "Upload in progress. Are you sure you want to leave?";
      }
    };

    if (uploadProgress.isPolling) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [uploadProgress.isPolling]);

  //Prevent accidental navigation during upload
  useEffect(() => {
    if (uploadProgress.isPolling) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent Ctrl+R, F5, Ctrl+W, etc.
        if (
          (e.ctrlKey && (e.key === "r" || e.key === "w")) ||
          e.key === "F5" ||
          (e.altKey && e.key === "F4")
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [uploadProgress.isPolling]);

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={uploadProgress.isPolling ? () => {} : () => setIsOpen(false)}
      layout="right"
      bodyStyle="pb-[100px]"
    >
      <div className="relative">
        <form
          className="flex flex-col items-center bg-white"
          onSubmit={handleSubmit}
          noValidate
        >
          <div
            className={`flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree ${
              file ? "bg-paleCreamGradientLeft" : "bg-paleGrayGradientLeft"
            }`}
          >
            <h2
              style={{ textShadow: "1px 1px grey" }}
              className="text-xl text-textBlack font-semibold font-secondary"
            >
              New Sales (Batch Upload)
            </h2>
            {uploadProgress.isPolling && (
              <div className="ml-3 flex items-center">
                <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600 font-medium">
                  Uploading...
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
            <FileInput
              name="salesFile"
              label="Sales File"
              onChange={handleFileChange}
              required={true}
              placeholder="Upload Sales File"
              errorMessage={getFieldError("salesFile")}
              iconRight={<RxFilePlus color="black" title="Upload File" />}
              description="Accepted formats: .csv, .xlsx, .xls"
              disabled={uploadProgress.isPolling}
            />

            <ApiErrorMessage apiError={apiError} />

            <ProceedButton
              type="submit"
              variant={file && !uploadProgress.isPolling ? "gradient" : "gray"}
              loading={loading || uploadProgress.isPolling}
              disabled={!file || uploadProgress.isPolling}
              //   text={uploadProgress.isPolling ? "Processing..." : "Upload Sales"}
            />

            {uploadProgress.isPolling && (
              <div className="w-full px-4 py-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Processing...</span>
                  <span>{uploadProgress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      uploadProgress.progress == 100
                        ? "bg-gradient-to-r from-green-500 to-green-600"
                        : "bg-gradient-to-r from-gold to-primary"
                    }`}
                    style={{ width: `${uploadProgress.progress}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-500 mt-2">
                  Status: {uploadProgress.status}
                </div>

                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Session ID:</span>
                      <span className="font-mono text-xs">
                        {uploadProgress.sessionId?.slice(-8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Progress:</span>
                      <span>{uploadProgress.progress}% complete</span>
                    </div>
                    <div className="text-center text-xs text-orange-600 mt-2 font-medium">
                      ⚠️ Please do not close this window or refresh the page
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BatchUploadSales;
