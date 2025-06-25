import React from "react";
import { CgChevronLeft, CgChevronRight } from "react-icons/cg";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  label: string;
}

const ListPagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  label,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center w-max h-[24px] space-x-2">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-[20px] h-[20px] rounded-[4px] ${
          currentPage === 1 ? "bg-disabled cursor-not-allowed" : "bg-purpleBlue"
        }`}
      >
        <CgChevronLeft color="white" />
      </button>

      <span className="flex items-center justify-center text-textBlack text-sm w-max h-[24px] px-2.5 border border-strokeGreyThree rounded-full">
        {startItem} - {endItem}
      </span>

      <span className="text-textDarkGrey text-xs">
        of {totalItems} {label}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-[20px] h-[20px] rounded-[4px] ${
          currentPage === totalPages
            ? "bg-disabled cursor-not-allowed"
            : "bg-purpleBlue"
        }`}
      >
        <CgChevronRight color="white" />
      </button>
    </div>
  );
};

export default ListPagination;
