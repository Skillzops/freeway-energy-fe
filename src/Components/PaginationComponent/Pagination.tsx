import useBreakpoint from "../../hooks/useBreakpoint";

type PaginationProps = {
  totalEntries: number;
  entriesPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEntriesPerPageChange: (entries: number) => void;
};

export const Pagination = ({
  totalEntries,
  entriesPerPage,
  currentPage,
  onPageChange,
  onEntriesPerPageChange,
}: PaginationProps) => {
  const paginationMobileStyle = useBreakpoint("max", 390);
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    onPageChange(newPage);
  };

  const handleEntriesPerPageChange = (newEntriesPerPage: number) => {
    onPageChange(1); // Reset to page 1
    onEntriesPerPageChange(newEntriesPerPage);
  };

  const multiplesOfTen = Array.from({ length: 10 }, (_, i) => (i + 1) * 10);

  // Calculate pages to show with ellipsis logic
  const pagesToShow: (number | string)[] = [];

  if (totalPages <= 5) {
    // If total pages are 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      pagesToShow.push(i);
    }
  } else {
    // Always show first page
    pagesToShow.push(1);

    // If current page is closer to the beginning, show pages around it
    if (currentPage <= 3) {
      pagesToShow.push(2, 3, 4);
      pagesToShow.push("...");
    }
    // If current page is closer to the end, show pages around the end
    else if (currentPage >= totalPages - 2) {
      pagesToShow.push("...");
      pagesToShow.push(totalPages - 3, totalPages - 2, totalPages - 1);
    }
    // Else, show ellipses and surrounding pages
    else {
      pagesToShow.push("...");
      pagesToShow.push(currentPage - 1, currentPage, currentPage + 1);
      pagesToShow.push("...");
    }

    // Always show last page
    pagesToShow.push(totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-1 w-full min-h-[45px]">
      <div
        className={`flex items-center sm:w-auto h-[24px]
        ${
          paginationMobileStyle
            ? "w-full justify-center mb-2 gap-4"
            : "w-[48%] justify-start gap-2"
        }
        `}
      >
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-disabled={currentPage === 1}
          className={`${
            currentPage === 1
              ? " bg-disabled hover:cursor-not-allowed"
              : "bg-transparent hover:cursor-pointer"
          } text-sm text-textLightGrey px-2.5 border border-strokeGreyThree rounded-full`}
        >
          Prev
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-2">
          {pagesToShow.map((page, index) =>
            typeof page === "number" ? (
              <button
                key={index}
                onClick={() => handlePageChange(page)}
                aria-current={currentPage === page ? "page" : undefined}
                className={`${
                  currentPage === page
                    ? "bg-disabled text-blackBrown font-bold border border-blackBrown"
                    : "text-textLightGrey border border-strokeGreyThree"
                } text-sm px-2.5 rounded-full`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="text-xl text-textLightGrey">
                {page}
              </span>
            )
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-disabled={currentPage === totalPages}
          className={`${
            currentPage === totalPages
              ? "bg-disabled hover:cursor-not-allowed"
              : "bg-transparent hover:cursor-pointer"
          } text-sm text-textLightGrey px-2.5 border border-strokeGreyThree rounded-full`}
        >
          Next
        </button>
      </div>

      {/* Page Size Selector */}
      <div
        className={`flex items-center justify-end sm:w-auto h-[24px]
          ${
            paginationMobileStyle
              ? "w-full justify-center gap-4"
              : "w-[48%] justify-start gap-2.5"
          }
        `}
      >
        <span className="text-xs text-textLightGrey">Showing</span>
        <select
          value={entriesPerPage}
          onChange={(e) => handleEntriesPerPageChange(Number(e.target.value))}
          className="text-sm text-textDarkGrey pl-1 h-[24px] border border-strokeGreyThree rounded-full"
        >
          {multiplesOfTen.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
        <span className="text-xs text-textLightGrey">
          of {totalEntries} entries
        </span>
      </div>
    </div>
  );
};
