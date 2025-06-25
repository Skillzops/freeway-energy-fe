import { useState, useEffect } from "react";

// Helper function to get ordinal suffix for the day
const getOrdinalSuffix = (day: number) => {
  if (day > 3 && day < 21) return "th"; // covers 11th, 12th, 13th
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

// Custom hook to get the formatted date
export const useFormattedCurrentDate = () => {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" }); // "July"
    const year = date.getFullYear();

    // Format the date as "29th, July 2024"
    const formatted = `${day}${getOrdinalSuffix(day)}, ${month} ${year}`;
    setFormattedDate(formatted);
  }, []);

  return formattedDate;
};

export const useFormattedDate =()=> {

}
