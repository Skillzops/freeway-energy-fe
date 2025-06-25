import { useErrorBoundary } from "react-error-boundary";

const useGlobalErrorBoundary = () => {
  const { showBoundary } = useErrorBoundary();

  const handleErrorBoundary = (
    error: any,
    isNetworkError: boolean,
    title?: string,
    message?: string,
    statusCode?: number
  ) => {
    const errorData = error?.response?.data;

    if (!error) return;
    if (isNetworkError) showBoundary({ isNetworkError });
    else if ([500, 405, 404].includes(errorData?.statusCode)) {
      showBoundary({ title, message, statusCode });
    } else return;
  };

  return { handleErrorBoundary };
};

export default useGlobalErrorBoundary;
