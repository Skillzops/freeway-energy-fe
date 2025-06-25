import { CardComponent } from "../CardComponents/CardComponent";
import { SaleTransactionsType } from "./SalesDetailsModal";
import { toast } from "react-toastify";
import { closePaymentModal, useFlutterwave } from "flutterwave-react-v3";
import { FlutterwaveConfig } from "flutterwave-react-v3/dist/types";
import { useCallback, useEffect, useState } from "react";

type PaymentInfo = {
  id: string;
  transactionRef: string;
  amount: number;
  paymentStatus: "PENDING" | "COMPLETED";
  paymentDate: string;
  saleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

const public_key =
  import.meta.env.VITE_FLW_PUBLIC_KEY ||
  "FLWPUBK_TEST-720d3bd8434091e9b28a01452ebdd2e0-X";
const base_url = import.meta.env.VITE_API_BASE_URL;

const SaleTransactions = ({
  data,
}: {
  data: {
    entries: SaleTransactionsType[];
    paymentInfo: PaymentInfo[];
    customer: {
      name: string;
      phone_number: any;
      email: any;
    };
  };
}) => {
  const [paymentConfig, setPaymentConfig] = useState<FlutterwaveConfig>();

  const handleFlutterPayment = useFlutterwave(
    paymentConfig as FlutterwaveConfig
  );

  const getPaymentInfoById = (paymentId: string) => {
    const selectedPaymentData = data?.paymentInfo?.find(
      (p) => p.id === paymentId
    );

    const newPaymentData: FlutterwaveConfig = {
      public_key,
      tx_ref: selectedPaymentData?.transactionRef as string,
      amount: selectedPaymentData?.amount as number,
      currency: "NGN",
      redirect_url: `${base_url}/sales`,
      payment_options: "banktransfer, card, ussd, account",
      customer: data.customer,
      customizations: {
        title: "Product Purchase",
        description: `Payment for sale ${selectedPaymentData?.saleId}`,
        logo: "https://res.cloudinary.com/bluebberies/image/upload/v1726242207/Screenshot_2024-09-04_at_2.43.01_PM_fcjlf3.png",
      },
      meta: {
        saleId: selectedPaymentData?.saleId,
      },
    };

    setPaymentConfig(newPaymentData);
  };

  const initializePayment = useCallback(() => {
    if (!paymentConfig) {
      console.error("Payment configuration is missing.");
      return;
    }

    handleFlutterPayment({
      callback: (response) => {
        console.log("Flutterwave Response:", response);
        closePaymentModal();
        toast.success("Payment Successful");
      },
      onClose: () => {
        toast.info("Payment Cancelled");
      },
    });
  }, [handleFlutterPayment, paymentConfig]);

  useEffect(() => {
    if (paymentConfig) {
      initializePayment();
    }
  }, [initializePayment, paymentConfig]);

  const dropDownList = {
    items: ["Make Payment"],
    onClickLink: (index: number, cardData: any) => {
      switch (index) {
        case 0:
          getPaymentInfoById(cardData?.productId);
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {data?.entries?.map((item, index) => (
        <CardComponent
          key={index}
          variant="salesTransactions"
          transactionId={item?.transactionId}
          productId={item?.transactionId}
          transactionStatus={item?.paymentStatus}
          datetime={item?.datetime}
          productType={item?.productCategory}
          productTag={item?.paymentMode}
          transactionAmount={item?.amount}
          dropDownList={dropDownList}
          showDropdown={item?.paymentStatus === "COMPLETED" ? false : true}
        />
      ))}
    </div>
  );
};

export default SaleTransactions;
