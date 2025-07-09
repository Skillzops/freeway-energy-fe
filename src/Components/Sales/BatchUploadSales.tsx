// BatchUploadSales.tsx
import { useApiCall } from "@/utils/useApiCall";
import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { z } from "zod";
import { Modal } from "../ModalComponent/Modal";
import { FileInput } from "../InputComponent/Input";
import ApiErrorMessage from "../ApiErrorMessage";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { RxFilePlus } from "react-icons/rx";

const FileFormSchema = z.object({
    salesFile: z
        .instanceof(File, { message: "Sales file is required" })
        .refine(
            (file) => ["csv", "xlsx", "xls"].includes(file.name.split('.').pop()?.toLowerCase() || ''),
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
    const [apiError, setApiError] = useState<string | Record<string, string[]>>("");

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!file) {
                throw new Error("Sales file is required");
            }

            const formData = new FormData();
            formData.append("file", file);

            await apiCall({
                endpoint: "v1/csv-upload/process",
                method: "post",
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                successMessage: "Sales uploaded successfully!",
            });

            await allSalesRefresh();
            setIsOpen(false);
            setFile(null);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                setFormErrors(error.issues);
            } else {
                const message =
                    error?.response?.data?.message ||
                    "Sales Upload Failed: Internal Server Error";
                setApiError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const getFieldError = (fieldName: string) => {
        return formErrors.find((error) => error.path[0] === fieldName)?.message;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            layout="right"
            bodyStyle="pb-[100px]"
        >
            <form
                className="flex flex-col items-center bg-white"
                onSubmit={handleSubmit}
                noValidate
            >
                <div
                    className={`flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree ${file ? "bg-paleCreamGradientLeft" : "bg-paleGrayGradientLeft"
                        }`}
                >
                    <h2
                        style={{ textShadow: "1px 1px grey" }}
                        className="text-xl text-textBlack font-semibold font-secondary"
                    >
                        New Sales (Batch Upload)
                    </h2>
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
                    />
                    <ApiErrorMessage apiError={apiError} />
                    <ProceedButton
                        type="submit"
                        variant={file ? "gradient" : "gray"}
                        loading={loading}
                        disabled={!file}
                    />
                </div>
            </form>
        </Modal>
    );
};

export default BatchUploadSales;