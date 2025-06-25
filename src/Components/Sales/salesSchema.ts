import { z } from "zod";

export const saleRecipientSchema = z.object({
  firstname: z.string().trim().min(2, "Firstname is required"),
  lastname: z.string().trim().min(2, "Lastname is required"),
  address: z.string().trim().min(1, "Address is required"),
  phone: z.string().trim().min(10, "Phone number is required"),
  email: z.string().trim().email("Invalid email"),
});

export const identificationDetailsSchema = z
  .object({
    idType: z.string().trim().min(2, "ID Type is required"),
    idNumber: z.string().trim().min(5, "ID Number is required"),
    issuingCountry: z.string().trim().min(2, "Issuing Country is required"),
    issueDate: z
      .string()
      .trim()
      .nonempty({ message: "Issue date is required" })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid issue date",
      })
      .refine((date) => new Date(date) <= new Date(), {
        message: "Issue date cannot be in the future",
      }),

    expirationDate: z
      .string()
      .trim()
      .nonempty({ message: "Expiration date is required" })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid expiration date",
      })
      .refine((date) => new Date(date) > new Date(), {
        message: "Expiration date must be in the future",
      }),
    fullNameAsOnID: z.string().trim().min(3, "Full name as on ID is required"),
    addressAsOnID: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (data.issueDate && data.expirationDate) {
      const issueDate = new Date(data.issueDate);
      const expirationDate = new Date(data.expirationDate);

      if (expirationDate <= issueDate) {
        ctx.addIssue({
          code: "custom",
          path: ["expirationDate"],
          message: "Expiration date must be later than issue date",
        });
      }
    }
  });

export const nextOfKinDetailsSchema = z.object({
  fullName: z.string().trim().min(3, "Full name is required"),
  relationship: z.string().trim().min(2, "Relationship is required"),
  phoneNumber: z.string().trim().min(10, "Phone number is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
  homeAddress: z.string().trim(),
  dateOfBirth: z
    .string()
    .trim()
    .nonempty({ message: "Issue date is required" })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date of birth",
    })
    .refine((date) => new Date(date) <= new Date(), {
      message: "Date of birth cannot be in the future",
    }),
  nationality: z.string().trim(),
});

export const guarantorDetailsSchema = z.object({
  fullName: z.string().trim().min(3, "Full name is required"),
  phoneNumber: z.string().trim().min(10, "Phone number is required"),
  email: z.string().trim().email("Invalid email").or(z.literal("")),
  homeAddress: z.string().trim().min(1, "Home address is required"),
  dateOfBirth: z
    .string()
    .trim()
    .nonempty({ message: "Issue date is required" })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date of birth",
    })
    .refine((date) => new Date(date) <= new Date(), {
      message: "Date of birth cannot be in the future",
    }),
  nationality: z.string().trim(),
  identificationDetails: identificationDetailsSchema,
});

export const saleItemSchema = z
  .object({
    productId: z.string().trim().min(10, "Product ID is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    paymentMode: z.enum(["ONE_OFF", "INSTALLMENT"], {
      message: "Payment Mode is required",
    }),
    discount: z.number().optional(),
    installmentDuration: z.number().optional(),
    installmentStartingPrice: z.number().optional(),
    devices: z.array(z.string()).min(1, "At least one device is required"),
    miscellaneousPrices: z
      .record(z.string(), z.number().min(0, "Price must be a positive number"))
      .optional(),
    saleRecipient: saleRecipientSchema,
  })
  .superRefine((data, ctx) => {
    // Conditional validation: If payment mode is INSTALLMENT, ensure related fields are filled
    if (data.paymentMode === "INSTALLMENT") {
      if (!data.installmentDuration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Installment duration is required for installment payments",
          path: ["installmentDuration"],
        });
      }
      if (!data.installmentStartingPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Installment starting price is required for installment payments",
          path: ["installmentStartingPrice"],
        });
      }
    }
  });

export const formSchema = z
  .object({
    category: z.enum(["PRODUCT"], {
      message: "Category is required",
    }),
    customerId: z.string().min(1, "Please select at least one customer"),
    saleItems: z
      .array(saleItemSchema)
      .min(1, "At least one sale item is required"),
    bvn: z
      .string()
      .length(11, "BVN must be exactly 11 digits")
      .regex(/^\d+$/, "BVN must contain only numbers")
      .optional(),
    identificationDetails: identificationDetailsSchema.optional(),
    nextOfKinDetails: nextOfKinDetailsSchema.optional(),
    guarantorDetails: guarantorDetailsSchema.optional(),
    applyMargin: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    // Check if any sale item has paymentMode as "INSTALLMENT"
    const hasInstallment = data.saleItems.some(
      (item) => item.paymentMode === "INSTALLMENT"
    );

    // If any sale item has paymentMode as "INSTALLMENT", enforce identificationDetails, nextOfKinDetails and guarantorDetails
    if (hasInstallment) {
      // Validate identificationDetails
      if (!data.identificationDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Identification details are required for installment payments",
          path: ["identificationDetails"],
        });
      } else {
        // Validate the nested schema for identificationDetails
        const identificationValidation = identificationDetailsSchema.safeParse(
          data.identificationDetails
        );
        if (!identificationValidation.success) {
          identificationValidation.error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: ["identificationDetails", ...issue.path],
            });
          });
        }
      }

      // Validate nextOfKinDetails
      if (!data.nextOfKinDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Next of kin details are required for installment payments",
          path: ["nextOfKinDetails"],
        });
      } else {
        // Validate the nested schema for nextOfKinDetails
        const nextOfKinValidation = nextOfKinDetailsSchema.safeParse(
          data.nextOfKinDetails
        );
        if (!nextOfKinValidation.success) {
          nextOfKinValidation.error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: ["nextOfKinDetails", ...issue.path],
            });
          });
        }
      }

      // Validate guarantorDetails
      if (!data.guarantorDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Guarantor details are required for installment payments",
          path: ["guarantorDetails"],
        });
      } else {
        // Validate the nested schema for guarantorDetails
        const guarantorValidation = guarantorDetailsSchema.safeParse(
          data.guarantorDetails
        );
        if (!guarantorValidation.success) {
          guarantorValidation.error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: ["guarantorDetails", ...issue.path],
            });
          });
        }
      }
    }
  });

export type SaleItem = {
  productId: string;
  quantity: number;
  paymentMode: "INSTALLMENT" | "ONE_OFF";
  discount?: number;
  installmentDuration?: number;
  installmentStartingPrice?: number;
  devices: string[];
  miscellaneousPrices?: {
    [key: string]: number;
  };
  saleRecipient: {
    firstname: string;
    lastname: string;
    address: string;
    phone: string;
    email: string;
  };
};

type NextOfKinDetails = {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  homeAddress: string;
  dateOfBirth: string;
  nationality: string;
};

type IdentificationDetails = {
  idType: string;
  idNumber: string;
  issuingCountry: string;
  issueDate: string;
  expirationDate: string;
  fullNameAsOnID: string;
  addressAsOnID: string;
};

type GuarantorDetails = {
  fullName: string;
  phoneNumber: string;
  email: string;
  homeAddress: string;
  identificationDetails: IdentificationDetails;
  dateOfBirth: string;
  nationality: string;
};

export type SalePayload = {
  category: "PRODUCT";
  customerId: string;
  bvn?: string;
  saleItems: SaleItem[];
  nextOfKinDetails?: NextOfKinDetails;
  identificationDetails?: IdentificationDetails;
  guarantorDetails?: GuarantorDetails;
  applyMargin: boolean;
};

export const defaultSaleFormData: SalePayload = {
  category: "PRODUCT",
  customerId: "",
  applyMargin: true,
  bvn: "",
  saleItems: [],
  nextOfKinDetails: {
    fullName: "",
    relationship: "",
    phoneNumber: "",
    email: "",
    homeAddress: "",
    dateOfBirth: "",
    nationality: "",
  },
  identificationDetails: {
    idType: "",
    idNumber: "",
    issuingCountry: "",
    issueDate: "",
    expirationDate: "",
    fullNameAsOnID: "",
    addressAsOnID: "",
  },
  guarantorDetails: {
    fullName: "",
    phoneNumber: "",
    email: "",
    homeAddress: "",
    dateOfBirth: "",
    nationality: "",
    identificationDetails: {
      idType: "",
      idNumber: "",
      issuingCountry: "",
      issueDate: "",
      expirationDate: "",
      fullNameAsOnID: "",
      addressAsOnID: "",
    },
  },
};
