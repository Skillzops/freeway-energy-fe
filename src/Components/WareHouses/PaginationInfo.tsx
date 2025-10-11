import React from "react";

interface PaginationInfoProps {
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  totalItems: number;
  showingStart?: number;
  showingEnd?: number;
  onPageChange?: (page: number) => void;
}

export function PaginationInfo({ 
  currentPage = 1, 
  totalPages = 1, 
  itemsPerPage = 10,
  totalItems,
  showingStart,
  showingEnd,
  onPageChange
}: PaginationInfoProps) {
  const actualShowingStart = showingStart ?? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const actualShowingEnd = showingEnd ?? Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalItems === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-strokeGreyTwo">
        <div className="text-sm text-textDarkGrey">
          Showing 0 of 0 entries
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-strokeGreyTwo">
      <div className="text-sm text-textDarkGrey">
        Showing {actualShowingStart} to {actualShowingEnd} of {totalItems} entries
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="h-8 px-3 border border-strokeGreyThree rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          ← Prev
        </button>
        
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-sm text-textDarkGrey">...</span>
              ) : (
                <button
                  onClick={() => handlePageClick(page as number)}
                  className={`h-8 w-8 rounded-lg text-sm ${
                    currentPage === page 
                      ? "bg-primary text-white" 
                      : "border border-strokeGreyThree hover:bg-gray-50"
                  } transition-colors`}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>
        
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="h-8 px-3 border border-strokeGreyThree rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}