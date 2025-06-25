import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import { ApiErrorStatesType } from "@/utils/useApiCall";
import { ErrorComponent } from "@/Pages/ErrorPage";
import { KeyedMutator } from "swr";

export type DataStateWrapperProps = {
  isLoading: boolean;
  error: string | null;
  errorMessage?: string;
  errorStates: ApiErrorStatesType;
  errorClass?: string;
  refreshData: KeyedMutator<any>;
  className?: string;
  children: React.ReactNode;
};

export const DataStateWrapper: React.FC<DataStateWrapperProps> = ({
  isLoading,
  error,
  errorStates,
  errorMessage,
  errorClass,
  refreshData,
  className,
  children,
}) => {
  if (isLoading)
    return <LoadingSpinner parentClass="absolute top-[50%] w-full" />;
  if (error)
    return (
      <ErrorComponent
        message={errorMessage || "Failed to fetch data."}
        className={errorClass}
        refreshData={refreshData}
        errorData={errorStates}
      />
    );
  return <div className={className}>{children}</div>;
};
