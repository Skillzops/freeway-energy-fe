import { useNavigate, useLocation } from "react-router-dom";
import useTokens from "../hooks/useTokens";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { toJS } from "mobx";

type SortOrder = "asc" | "desc";

export function copyToClipboard(value: any) {
  if (!navigator.clipboard) {
    return;
  }

  const textToCopy = String(value);

  navigator.clipboard.writeText(textToCopy).then(() => {
    toast.info(`Copied "${textToCopy}" to clipboard.`);
  });
}

export const formatDateTime = (
  format: "date" | "time" | "datetime",
  dateString: string
) => {
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");

  // 12-hour format conversion
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12; // Convert 0 (midnight) to 12

  const formattedDate = `${day}/${month}/${year}`;
  const formattedTime = `${hours}:${minutes}${ampm}`;

  if (format === "date") {
    return formattedDate;
  } else if (format === "time") {
    return formattedTime;
  } else {
    return `${formattedDate}; ${formattedTime}`;
  }
};

export function capitalizeFirstLetter(str: string) {
  if (!str) return str; // Return the original string if it's empty or undefined
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatNumberWithCommas(number: number | string): string {
  // Trim whitespace if the input is a string
  if (typeof number === "string") number = number.trim();

  // Ensure number is valid and convert it
  if (number == null || isNaN(Number(number))) return "0";

  const num = Number(number);
  const numStr = num.toFixed(num % 1 !== 0 ? 2 : 0);

  // Add commas for thousands separators
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function useIsLoggedIn(route: string) {
  const { token } = useTokens();
  const navigate = useNavigate();
  const sessionRedirect = sessionStorage.getItem("redirect");

  useEffect(() => {
    if (token) {
      const redirectTo = sessionRedirect || route;
      sessionStorage.removeItem("redirect");
      navigate(redirectTo);
    }
  }, [token, navigate, route, sessionRedirect]);
}

export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Ensure the scroll position resets
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
};

export const checkIfArraysAreEqual = (arr1: string[], arr2: string[]) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item) => arr2.includes(item));
};

export function sortArrayByKey<T extends Record<string, any>>(
  arr: T[],
  key: keyof T,
  order: SortOrder = "asc"
): T[] {
  return arr.sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    // Handle undefined or null values
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return order === "asc" ? -1 : 1;
    if (valueB == null) return order === "asc" ? 1 : -1;

    // Sorting logic for numbers or strings
    if (typeof valueA === "number" && typeof valueB === "number") {
      return order === "asc" ? valueA - valueB : valueB - valueA;
    }

    if (typeof valueA === "string" && typeof valueB === "string") {
      return order === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    return 0;
  });
}

export const formatDateForInput = (isoDate: string | undefined): string => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  return date.toISOString().split("T")[0]; // Format to "YYYY-MM-DD"
};

export const revalidateStore = (store: any) => toJS(store);

export function truncateTextByWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength).trim();
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  // If there's no space, just cut at maxLength
  if (lastSpaceIndex === -1) return truncated + "...";

  return truncated.substring(0, lastSpaceIndex) + "...";
}
