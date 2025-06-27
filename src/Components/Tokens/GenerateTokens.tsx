import { useApiCall, useGetRequest } from "@/utils/useApiCall";
import React, { useState, useEffect, useRef } from "react";
import { KeyedMutator } from "swr";
import { z } from "zod";
import { Modal } from "../ModalComponent/Modal";
import { FileInput, Input, SelectInput } from "../InputComponent/Input";
import ApiErrorMessage from "../ApiErrorMessage";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { RxFilePlus } from "react-icons/rx";
import {
  FiCopy,
  FiDownload,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
} from "react-icons/fi";
import jsPDF from "jspdf";

interface GenerateTokensProps {
  isOpen: boolean;
  isTokenable: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allDevicesRefresh: KeyedMutator<any>;
  formType: "singleUpload" | "batchUpload";
}

interface JobStatus {
  id: string;
  status: "waiting" | "active" | "completed" | "failed";
  progress: number;
  data?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

const DeviceFormSchema = z.object({
  deviceID: z.string().trim().min(1, "Device selection is required"),
  tokenDuration: z
    .string()
    .trim()
    .min(1, "Token duration is required")
    .refine((val) => /^\d+$/.test(val), {
      message: "Token duration must be a valid number (days)",
    })
    .refine((val) => parseInt(val) > 0 && parseInt(val) <= 365, {
      message: "Token duration must be between 1 and 365 days",
    }),
});

const GenerateTokens = ({
  isOpen,
  setIsOpen,
  allDevicesRefresh,
  formType,
}: GenerateTokensProps) => {
    const { apiCall } = useApiCall();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );
  const [generatedToken, setGeneratedToken] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Move these useState hooks to top level to fix the hooks error
  const [showAllTokens, setShowAllTokens] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    deviceID: "",
    tokenDuration: "",
    devicesFile: null as File | null,
  });
  const {
    data: devicesData,
    isLoading: devicesLoading,
    error: devicesError,
    mutate: refreshDevices,
  } = useGetRequest("/v1/device", isOpen);

  const deviceOptions =
    devicesData?.devices
      ?.filter((device: any) => device.isTokenable === true)
      ?.map((device: any) => ({
        label: `${device.serialNumber} - ${device.hardwareModel}`,
        value: device.id,
      })) || [];

  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await apiCall({
        endpoint: `/v1/device/batch/job/${jobId}/status`,
        method: "get",
        showToast: false,
      });

      const status = response?.data as JobStatus;
      setJobStatus(status);

      if (status.status === "completed") {
        try {
          const resultResponse = await apiCall({
            endpoint: `/v1/device/batch/job/${jobId}/result`,
            method: "get",
            showToast: false,
          });

          setGeneratedToken(resultResponse?.data);
          setCurrentJobId(null);
          setLoading(false);

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          await allDevicesRefresh();
        } catch (error) {
          console.error("Error fetching job result:", error);
          setApiError("Failed to fetch job result");
          setLoading(false);
        }
      } else if (status.status === "failed") {
        setApiError(status.error || "Job failed");
        setCurrentJobId(null);
        setLoading(false);

        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (error: any) {
      console.error("Error polling job status:", error);
      if (error?.response?.status === 404) {
        setApiError("Job not found");
        setCurrentJobId(null);
        setLoading(false);

        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    }
  };

  const startPolling = (jobId: string) => {
    setCurrentJobId(jobId);
    setJobStatus({
      id: jobId,
      status: "waiting",
      progress: 0,
      createdAt: new Date(),
    });

    pollJobStatus(jobId);

    pollingIntervalRef.current = setInterval(() => {
      pollJobStatus(jobId);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setCurrentJobId(null);
      setJobStatus(null);
    }
  }, [isOpen]);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");
    setFormErrors([]);

    try {
      if (formType === "singleUpload") {
        const result = DeviceFormSchema.safeParse(formData);

        if (!result.success) {
          setFormErrors(result.error.issues);
          return;
        }

        const validatedData = result.data;

        const selectedDevice = devicesData?.devices?.find(
          (device: any) => device.id === validatedData.deviceID
        );
        if (!selectedDevice) {
          throw new Error("Selected device not found");
        }

        const apiData = {
          tokenDuration: Number(validatedData.tokenDuration),
        };

        const response = await apiCall({
          endpoint: `/v1/device/${validatedData.deviceID}/generate-token`,
          method: "post",
          data: apiData,
          successMessage: "Token generated successfully!",
        });

        const tokenData = {
          ...response?.data,
          deviceSerialNumber: selectedDevice.serialNumber,
          deviceModel: selectedDevice.hardwareModel,
          deviceId: selectedDevice.id,
        };
        setGeneratedToken(tokenData);
        await allDevicesRefresh();
      } else {
        if (!formData.devicesFile) {
          throw new Error("Device file is required");
        }

        const formDataToSend = new FormData();
        formDataToSend.append("file", formData.devicesFile);

        const response = await apiCall({
          endpoint: "/v1/device/batch/generate-tokens",
          method: "post",
          data: formDataToSend,
          headers: {
            "Content-Type": "multipart/form-data",
          },
          successMessage: "Batch processing started!",
        });

        if (response?.data?.jobId) {
          startPolling(response.data.jobId);
        } else {
          throw new Error("No job ID received from server");
        }
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          `Token${
            formType === "batchUpload" ? "s" : ""
          } Generation Failed: Internal Server Error`;
        setApiError(message);
      }
      setLoading(false);
    } finally {
      if (formType === "singleUpload") {
        setLoading(false);
      }
    }
  };

  const isFormFilled =
    formType === "singleUpload"
      ? formData.deviceID && formData.tokenDuration
      : !!formData.devicesFile;

  const getFieldError = (name: string) => {
    return (
      formErrors.find((error: z.ZodIssue) => error.path[0] === name)?.message ||
      ""
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setApiError("");
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
  };

  const handleDeviceSelect = (value: string) => {
    setFormData({ ...formData, deviceID: value });
    setApiError("");
    setFormErrors((prev) =>
      prev.filter((error) => error.path[0] !== "deviceID")
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, devicesFile: file });
    setApiError("");
  };
  const handleCloseModal = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setIsOpen(false);
    setFormData({
      deviceID: "",
      tokenDuration: "",
      devicesFile: null,
    });
    setFormErrors([]);
    setApiError("");
    setGeneratedToken(null);
    setCopySuccess(false);
    setJobStatus(null);
    setCurrentJobId(null);
    setLoading(false);

    // Reset batch results states
    setShowAllTokens(false);
    setSearchTerm("");
  };

  const handleGenerateAnother = () => {
    setFormData({
      deviceID: "",
      tokenDuration: "",
      devicesFile: null,
    });
    setFormErrors([]);
    setApiError("");
    setGeneratedToken(null);
    setCopySuccess(false);
    setJobStatus(null);
    setCurrentJobId(null);
    setLoading(false);

    // Reset batch results states
    setShowAllTokens(false);
    setSearchTerm("");
  };

  const handleExportToPDF = () => {
    if (!generatedToken) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = 30;

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Token Generation Report", margin, yPosition);

    yPosition += 20;

    // Date
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);

    yPosition += 20;

    if (formType === "batchUpload") {
      // Batch upload PDF export with actual tokens
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Batch Token Generation Summary:", margin, yPosition);

      yPosition += 15;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      // Summary stats
      doc.text(
        `Total Tokens Generated: ${generatedToken?.devicesProcessed || 0}`,
        margin,
        yPosition
      );
      yPosition += 10;
      doc.text(
        `Total Rows in File: ${generatedToken?.totalRows || 0}`,
        margin,
        yPosition
      );
      yPosition += 10;
      doc.text(
        `Errors: ${generatedToken?.errors?.length || 0}`,
        margin,
        yPosition
      );
      yPosition += 10;
      doc.text(
        `Completed At: ${
          generatedToken?.completedAt
            ? new Date(generatedToken.completedAt).toLocaleString()
            : "N/A"
        }`,
        margin,
        yPosition
      );
      yPosition += 25;

      // Token details section
      const tokens = generatedToken?.tokens || [];

      if (tokens.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Generated Tokens:", margin, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        // Table headers
        doc.setFont("helvetica", "bold");
        doc.text("Serial Number", margin, yPosition);
        doc.text("Token", margin + 60, yPosition);
        doc.text("Duration", margin + 140, yPosition);
        yPosition += 5;

        // Line under headers
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        doc.setFont("helvetica", "normal");

        // Add tokens (with pagination)
        tokens.forEach((token: any, index: number) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 30;

            // Re-add headers on new page
            doc.setFont("helvetica", "bold");
            doc.text("Serial Number", margin, yPosition);
            doc.text("Token", margin + 60, yPosition);
            doc.text("Duration", margin + 140, yPosition);
            yPosition += 5;
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 5;
            doc.setFont("helvetica", "normal");
          }

          // Add token row
          doc.text(token.deviceSerialNumber || "N/A", margin, yPosition);

          // Truncate long tokens to fit
          const tokenText = token.deviceToken || "N/A";
          const maxTokenLength = 25;
          const displayToken =
            tokenText.length > maxTokenLength
              ? tokenText.substring(0, maxTokenLength) + "..."
              : tokenText;
          doc.text(displayToken, margin + 60, yPosition);

          doc.text(
            `${token.tokenDuration || "N/A"} days`,
            margin + 140,
            yPosition
          );
          yPosition += 8;
        });

        // Add note about truncated tokens if any were truncated
        if (
          tokens.some((token: any) => (token.deviceToken || "").length > 25)
        ) {
          yPosition += 10;
          doc.setFontSize(8);
          doc.setFont("helvetica", "italic");
          doc.text(
            "Note: Some tokens are truncated in this PDF. Download CSV for complete tokens.",
            margin,
            yPosition
          );
        }
      }

      // Errors section
      const errors = generatedToken?.errors || [];
      if (errors.length > 0) {
        yPosition += 20;

        // Check if we need a new page for errors
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 30;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Processing Errors:", margin, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        errors.slice(0, 20).forEach((error: any, index: number) => {
          // Limit to first 20 errors
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 30;
          }

          doc.text(
            `Row ${error.row}: ${error.error} (${
              error.deviceSerialNumber || "Unknown"
            })`,
            margin,
            yPosition
          );
          yPosition += 8;
        });

        if (errors.length > 20) {
          yPosition += 5;
          doc.setFontSize(8);
          doc.setFont("helvetica", "italic");
          doc.text(
            `... and ${
              errors.length - 20
            } more errors. Download CSV for complete error list.`,
            margin,
            yPosition
          );
        }
      }
    } else {
      // Single token PDF export (existing logic)
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Token Details:", margin, yPosition);

      yPosition += 15;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      const tokenValue =
        generatedToken?.deviceToken ||
        generatedToken?.token ||
        generatedToken?.tokenValue ||
        "N/A";
      doc.text(`Token: ${tokenValue}`, margin, yPosition);
      yPosition += 10;

      if (generatedToken?.tokenDuration) {
        doc.text(
          `Duration: ${generatedToken.tokenDuration}`,
          margin,
          yPosition
        );
        yPosition += 10;
      }

      if (generatedToken?.deviceSerialNumber) {
        doc.text(
          `Device Serial Number: ${generatedToken.deviceSerialNumber}`,
          margin,
          yPosition
        );
        yPosition += 10;
      }

      if (generatedToken?.deviceId) {
        doc.text(`Device ID: ${generatedToken.deviceId}`, margin, yPosition);
        yPosition += 10;
      }

      if (generatedToken?.tokenId) {
        doc.text(`Token ID: ${generatedToken.tokenId}`, margin, yPosition);
        yPosition += 10;
      }

      // Add security border
      yPosition += 10;
      doc.setDrawColor(0, 0, 0);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 30);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Important: Keep this token secure", margin + 5, yPosition + 15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "This token provides access to your device. Do not share it with unauthorized users.",
        margin + 5,
        yPosition + 25
      );
    }

    // Save the PDF
    const fileName =
      formType === "batchUpload"
        ? `batch_tokens_${new Date().toISOString().split("T")[0]}.pdf`
        : `token_${generatedToken?.deviceSerialNumber || "device"}_${
            new Date().toISOString().split("T")[0]
          }.pdf`;
    doc.save(fileName);
  };
  const handleRefreshDevices = async () => {
    try {
      await refreshDevices();
    } catch (error) {
      console.error("Failed to refresh devices:", error);
    }
  };

  const renderJobStatus = () => {
    if (!jobStatus) return null;

    const getStatusIcon = () => {
      switch (jobStatus.status) {
        case "waiting":
          return <FiClock className="w-5 h-5 text-yellow-500" />;
        case "active":
          return <FiLoader className="w-5 h-5 text-blue-500 animate-spin" />;
        case "completed":
          return <FiCheckCircle className="w-5 h-5 text-green-500" />;
        case "failed":
          return <FiXCircle className="w-5 h-5 text-red-500" />;
        default:
          return <FiClock className="w-5 h-5 text-gray-500" />;
      }
    };

    const getStatusText = () => {
      switch (jobStatus.status) {
        case "waiting":
          return "Waiting to start...";
        case "active":
          return "Processing tokens...";
        case "completed":
          return "Completed successfully!";
        case "failed":
          return "Processing failed";
        default:
          return "Unknown status";
      }
    };

    return (
      <div className="w-full">
        <div className="bg-white border border-strokeGreyThree rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            {getStatusIcon()}
            <h3 className="text-lg font-semibold text-textBlack font-secondary">
              Batch Token Generation
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-textDarkGrey">
                  {getStatusText()}
                </span>
                <span className="text-sm font-medium text-textBlack">
                  {Math.round(jobStatus.progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-[#982214] to-[#F8CB48] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${jobStatus.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="text-sm text-textDarkGrey">
              <p>
                Job ID:{" "}
                <span className="font-mono text-textBlack">{jobStatus.id}</span>
              </p>
              <p>Started: {new Date(jobStatus.createdAt).toLocaleString()}</p>
              {jobStatus.completedAt && (
                <p>
                  Completed: {new Date(jobStatus.completedAt).toLocaleString()}
                </p>
              )}
            </div>

            {jobStatus.status === "failed" && jobStatus.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{jobStatus.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBatchResults = () => {
    if (!generatedToken || formType !== "batchUpload") return null;

    const tokens = generatedToken.tokens || [];
    const errors = generatedToken.errors || [];

    // Filter tokens based on search
    const filteredTokens = tokens.filter((token: any) =>
      token.deviceSerialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tokensToShow = showAllTokens
      ? filteredTokens
      : filteredTokens.slice(0, 10);

    const handleCopyAllTokens = async () => {
      const allTokensText = tokens
        .map(
          (token: any) => `${token.deviceSerialNumber}: ${token.deviceToken}`
        )
        .join("\n");

      try {
        await navigator.clipboard.writeText(allTokensText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error("Failed to copy tokens:", err);
      }
    };

    const handleDownloadCSV = () => {
      const csvContent = [
        [
          "Serial Number",
          "Token",
          "Duration",
          "Device ID",
          "Token ID",
          "Row",
        ].join(","),
        ...tokens.map((token: any) =>
          [
            token.deviceSerialNumber,
            token.deviceToken,
            token.tokenDuration || "",
            token.deviceId || "",
            token.tokenId || "",
            token.row || "",
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `batch_tokens_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    };

    return (
      <div className="w-full">
        <div className="bg-white border border-strokeGreyThree rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-4 h-4 bg-success rounded-full"></div>
            <h3 className="text-lg font-semibold text-textBlack font-secondary">
              Batch Processing Complete!
            </h3>
          </div>

          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-paleGrayGradient border border-strokeGreyTwo rounded-lg p-4">
                <div className="text-2xl font-bold text-primary mb-1">
                  {generatedToken.devicesProcessed || 0}
                </div>
                <div className="text-sm text-textDarkGrey">
                  Tokens Generated
                </div>
              </div>

              <div className="bg-paleGrayGradient border border-strokeGreyTwo rounded-lg p-4">
                <div className="text-2xl font-bold text-textBlack mb-1">
                  {generatedToken.totalRows || 0}
                </div>
                <div className="text-sm text-textDarkGrey">Total Rows</div>
              </div>

              <div className="bg-paleGrayGradient border border-strokeGreyTwo rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {errors.length || 0}
                </div>
                <div className="text-sm text-textDarkGrey">Errors</div>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search by serial number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-strokeGreyTwo rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyAllTokens}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  <FiCopy className="w-4 h-4" />
                  {copySuccess ? "Copied!" : "Copy All"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                >
                  <FiDownload className="w-4 h-4" />
                  Download CSV
                </button>
              </div>
            </div>

            {/* Tokens Table */}
            {tokens.length > 0 && (
              <div className="border border-strokeGreyTwo rounded-lg overflow-hidden">
                <div className="bg-paleGrayGradient px-4 py-3 border-b border-strokeGreyTwo">
                  <h4 className="font-medium text-textBlack">
                    Generated Tokens ({filteredTokens.length} of {tokens.length}
                    )
                  </h4>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textDarkGrey uppercase tracking-wider">
                          Serial Number
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textDarkGrey uppercase tracking-wider">
                          Token
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textDarkGrey uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textDarkGrey uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-strokeGreyTwo">
                      {tokensToShow.map((token: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono text-textBlack">
                            {token.deviceSerialNumber}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-textBlack">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[200px]">
                                {token.deviceToken}
                              </span>
                              <button
                                onClick={() =>
                                  handleCopyToClipboard(token.deviceToken)
                                }
                                className="text-primary hover:text-primaryDark"
                              >
                                <FiCopy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-textBlack">
                            {token.tokenDuration || "N/A"} days
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() =>
                                handleCopyToClipboard(
                                  `Serial: ${token.deviceSerialNumber}\nToken: ${token.deviceToken}\nDuration: ${token.tokenDuration} days`
                                )
                              }
                              className="text-primary hover:text-primaryDark text-xs"
                            >
                              Copy Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredTokens.length > 10 && (
                  <div className="px-4 py-3 bg-paleGrayGradient border-t border-strokeGreyTwo">
                    <button
                      onClick={() => setShowAllTokens(!showAllTokens)}
                      className="text-primary hover:text-primaryDark text-sm font-medium"
                    >
                      {showAllTokens
                        ? "Show Less"
                        : `Show All ${filteredTokens.length} Tokens`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Errors Section */}
            {errors.length > 0 && (
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                  <h4 className="font-medium text-red-800">
                    Processing Errors ({errors.length})
                  </h4>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-red-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">
                          Row
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">
                          Serial Number
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-red-200">
                      {errors.map((error: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-textBlack">
                            {error.row}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-textBlack">
                            {error.deviceSerialNumber || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600">
                            {error.error}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {generatedToken.completedAt && (
              <div>
                <label className="block text-sm font-medium text-textDarkGrey mb-2">
                  Completed At:
                </label>
                <div className="flex items-center gap-2 bg-paleGrayGradient px-3 py-2 w-max border border-strokeGreyTwo rounded-full">
                  <p className="text-sm text-textBlack font-medium">
                    {new Date(generatedToken.completedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-8 justify-center">
            <button
              type="button"
              onClick={handleGenerateAnother}
              className="bg-gradient-to-r from-[#982214] to-[#F8CB48] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium text-sm"
            >
              Process Another File
            </button>
            <button
              type="button"
              onClick={handleExportToPDF}
              className="bg-gradient-to-r from-[#982214] to-[#F8CB48] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium text-sm flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export Summary
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="bg-strokeGreyTwo text-textDarkGrey px-4 py-2 rounded-md hover:bg-strokeGreyThree transition-colors font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      layout="right"
      bodyStyle="pb-[100px]"
    >
      <form
        className="flex flex-col items-center bg-white"
        onSubmit={handleSubmit}
        noValidate
      >
        <div
          className={`flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree ${
            isFormFilled
              ? "bg-paleCreamGradientLeft"
              : "bg-paleGrayGradientLeft"
          }`}
        >
          <h2
            style={{ textShadow: "1px 1px grey" }}
            className="text-xl text-textBlack font-semibold font-secondary"
          >
            {formType === "singleUpload"
              ? "Generate Tokens"
              : "Generate Tokens (Batch)"}
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center w-full px-4 gap-4 py-8">
          {generatedToken ? (
            formType === "batchUpload" ? (
              renderBatchResults()
            ) : (
              <div className="w-full">
                <div className="bg-white border border-strokeGreyThree rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-success rounded-full"></div>
                    <h3 className="text-lg font-semibold text-textBlack font-secondary">
                      Token Generated Successfully!
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-textDarkGrey mb-3">
                        Generated Token:
                      </label>
                      <div className="bg-paleGrayGradient border border-strokeGreyTwo rounded-md p-4">
                        <code className="text-base font-mono text-textBlack break-all font-semibold">
                          {generatedToken?.deviceToken ||
                            generatedToken?.token ||
                            generatedToken?.tokenValue ||
                            "Token not found"}
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const tokenText =
                            generatedToken?.deviceToken ||
                            generatedToken?.token ||
                            generatedToken?.tokenValue ||
                            "Token not found";
                          handleCopyToClipboard(tokenText);
                        }}
                        className="mt-3 flex items-center gap-2 text-sm text-primary hover:text-primaryDark underline font-medium transition-colors"
                      >
                        <FiCopy className="w-4 h-4" />
                        {copySuccess ? "Copied!" : "Copy to clipboard"}
                      </button>
                    </div>

                    {generatedToken?.tokenDuration && (
                      <div>
                        <label className="block text-sm font-medium text-textDarkGrey mb-2">
                          Duration:
                        </label>
                        <div className="flex items-center gap-2 bg-paleGrayGradient px-3 py-2 w-max border border-strokeGreyTwo rounded-full">
                          <p className="text-sm text-textBlack font-medium">
                            {generatedToken.tokenDuration}
                          </p>
                        </div>
                      </div>
                    )}

                    {generatedToken?.deviceSerialNumber && (
                      <div>
                        <label className="block text-sm font-medium text-textDarkGrey mb-2">
                          Device Serial Number:
                        </label>
                        <div className="flex items-center gap-2 bg-paleGrayGradient px-3 py-2 w-max border border-strokeGreyTwo rounded-full">
                          <p className="text-sm text-textBlack font-mono font-medium">
                            {generatedToken.deviceSerialNumber}
                          </p>
                        </div>
                      </div>
                    )}

                    {generatedToken?.deviceId && (
                      <div>
                        <label className="block text-sm font-medium text-textDarkGrey mb-2">
                          Device ID:
                        </label>
                        <div className="flex items-center gap-2 bg-paleGrayGradient px-3 py-2 w-max border border-strokeGreyTwo rounded-full">
                          <p className="text-sm text-textBlack font-mono font-medium">
                            {generatedToken.deviceId}
                          </p>
                        </div>
                      </div>
                    )}

                    {generatedToken?.tokenId && (
                      <div>
                        <label className="block text-sm font-medium text-textDarkGrey mb-2">
                          Token ID:
                        </label>
                        <div className="flex items-center gap-2 bg-paleGrayGradient px-3 py-2 w-max border border-strokeGreyTwo rounded-full">
                          <p className="text-sm text-textBlack font-mono font-medium">
                            {generatedToken.tokenId}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-8 justify-center">
                    <button
                      type="button"
                      onClick={handleGenerateAnother}
                      className="bg-gradient-to-r from-[#982214] to-[#F8CB48] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium text-sm"
                    >
                      Generate Another
                    </button>
                    <button
                      type="button"
                      onClick={handleExportToPDF}
                      className="bg-gradient-to-r from-[#982214] to-[#F8CB48] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium text-sm flex items-center gap-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      Export to PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="bg-strokeGreyTwo text-textDarkGrey px-4 py-2 rounded-md hover:bg-strokeGreyThree transition-colors font-medium text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : currentJobId && jobStatus ? (
            renderJobStatus()
          ) : (
            <>
              {formType === "singleUpload" ? (
                <>
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium text-textDarkGrey">
                        Select Device *
                      </label>
                      <button
                        type="button"
                        onClick={handleRefreshDevices}
                        disabled={devicesLoading}
                        className="p-1 text-primary hover:text-primaryDark disabled:opacity-50 transition-colors"
                        title="Refresh devices list"
                      >
                        <FiRefreshCw
                          className={`w-4 h-4 ${
                            devicesLoading ? "animate-spin" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {devicesError ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
                        <p className="text-sm text-red-600">
                          Failed to load devices. Please try refreshing.
                        </p>
                      </div>
                    ) : (
                      <SelectInput
                        label=""
                        value={formData.deviceID}
                        onChange={handleDeviceSelect}
                        required={true}
                        errorMessage={getFieldError("deviceID")}
                        options={deviceOptions}
                        placeholder={
                          devicesLoading
                            ? "Loading devices..."
                            : "Select a device"
                        }
                        disabled={devicesLoading || deviceOptions.length === 0}
                      />
                    )}

                    {deviceOptions.length === 0 &&
                      !devicesLoading &&
                      !devicesError && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-600">
                            No tokenable devices available.
                          </p>
                        </div>
                      )}
                  </div>

                  <Input
                    type="text"
                    name="tokenDuration"
                    label="Token Duration (days)"
                    value={formData.tokenDuration}
                    onChange={handleInputChange}
                    placeholder="Enter duration in days (1-365)"
                    required={true}
                    errorMessage={getFieldError("tokenDuration")}
                  />
                </>
              ) : (
                <FileInput
                  name="devicesFile"
                  label="Devices File"
                  onChange={handleFileChange}
                  required={true}
                  accept=".csv,.xlsx"
                  placeholder="Upload Device File"
                  errorMessage={getFieldError("devicesFile")}
                  iconRight={<RxFilePlus color="black" title="Upload File" />}
                  description="Only .csv and .xlsx files are allowed"
                />
              )}

              <ApiErrorMessage apiError={apiError} />

              <ProceedButton
                type="submit"
                loading={loading}
                variant={isFormFilled ? "gradient" : "gray"}
                disabled={!isFormFilled || loading}
              />
            </>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default GenerateTokens;
