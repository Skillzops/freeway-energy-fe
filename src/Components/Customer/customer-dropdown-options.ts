export const CUSTOMER_CATEGORY_OPTIONS = [
  "Public",
  "Prepaid",
  "Residential",
  "Commercial",
  "Business",
].map((value) => ({ label: value, value }));

export const CUSTOMER_BUSINESS_OPTIONS = [
  "Tailor",
  "Fashion House",
  "Kiosk",
  "Computers",
  "Small Shop Provision",
  "Medium Shop Provisions",
  "Large Shop Provisions (Super Market)",
  "Groceries",
  "Fabrics",
  "Barber Shop",
  "Cold Storage",
  "Clinic",
  "Cosmetic Shop",
  "Miller",
  "Packing Store",
  "Grinder",
].map((value) => ({ label: value, value }));

export const GENERATOR_SIZE_OPTIONS = [
  "2.5kVA",
  "3.5kVA",
  "5kVA",
  "7.5kVA",
  "10kVA",
  "15kVA+",
  "No generator",
  "Other",
].map((value) => ({ label: value, value }));

export const DAILY_RUNTIME_OPTIONS = [
  "Under 4 hours",
  "4–8 hours",
  "8–12 hours",
  "12–16 hours",
  "16+ hours",
  "24 hours",
  "Other",
].map((value) => ({ label: value, value }));
