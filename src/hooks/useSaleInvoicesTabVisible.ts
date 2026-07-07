import { useMemo } from "react";

type SaleLike = { saleItems?: unknown[] } | null | undefined;

/**
 * Show the Invoices tab on sale detail modals whenever a sale is loaded.
 * (Agents and admins both need to view linked invoices; settings only
 * control auto-generation messaging inside SaleInvoices.)
 */
export function useSaleInvoicesTabVisible(
  isModalOpen: boolean,
  sale: SaleLike,
): boolean {
  return useMemo(() => {
    if (!isModalOpen) return false;
    return !!sale;
  }, [isModalOpen, sale]);
}
