import { useGetRequest } from "@/utils/useApiCall";
import React, { useCallback, useEffect } from "react";
import { DataStateWrapper } from "../Loaders/DataStateWrapper";
import type { Contract, SaleItem } from "./contractType";
import { formatDateTime } from "@/utils/helpers";

const ContractModal = ({
  setIsOpen,
  contractId,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  contractId: string;
}) => {
  const fetchSingleContract = useGetRequest(
    `/v1/contract/${contractId}`,
    false
  );

  const contractData: Contract = fetchSingleContract?.data;

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);

  const SectionHeader = ({ title }: { title: string }) => {
    return <header className="text-[1.15rem] font-bold">{title}</header>;
  };

  const FillInLine = () => (
    <span className="inline-block min-w-[150px] h-3 border-b border-black"></span>
  );

  return (
    <div className="flex items-center justify-center w-full">
      <div
        className="fixed inset-0 z-40 transition-opacity bg-black opacity-50"
        onClick={handleClose}
        aria-hidden="true"
      ></div>
      <section className="fixed inset-y-0 inset-x-[20%] z-50">
        <div className="bg-white h-screen overflow-y-auto">
          <DataStateWrapper
            isLoading={fetchSingleContract?.isLoading}
            error={fetchSingleContract?.error}
            errorStates={fetchSingleContract?.errorStates}
            refreshData={fetchSingleContract?.mutate}
            errorMessage="Failed to fetch contract details"
          >
            <div className="flex flex-col gap-4 w-full p-4">
              <h1 className="text-center font-bold text-[1.5rem]">
                END USER AGREEMENT
              </h1>
              <p>
                This <strong>AGREEMENT</strong> (the “Agreement”) is made
                between <strong>A4&T POWER SOLUTIONS LIMITED</strong>, (A4&T)
                and the <strong>CUSTOMER</strong> as set out in the execution
                section (the “Customer”) on the date appearing in the execution
                section below and sets out the terms and conditions upon which
                A4&T will sell its product(s) (the “Product”) to the Customer.
              </p>
              <section className="flex flex-col gap-2">
                <p>
                  The <strong>CUSTOMER</strong> hereby agrees as follows:
                </p>
                <div>
                  <SectionHeader title="1. Product" />
                  <p className="pb-2">
                    A4&T will sell to the Customer and the Customer agrees to
                    buy from A4&T the following product(s):
                  </p>
                  {contractData?.sale[0]?.saleItems?.length > 0 ? (
                    <ProductSelector
                      saleItems={contractData?.sale[0]?.saleItems}
                    />
                  ) : (
                    <p>No product(s) selected.</p>
                  )}
                </div>
              </section>
              <section>
                <SectionHeader title="2. Purchase Price & Payment Plans" />
                <p>
                  The Customer shall pay the purchase price for the Product,
                  based on pricing and payment plans made available by A4&T at
                  the time of signing the Agreement (the “Purchase Price”).
                </p>
                <br />
                <p className="leading-relaxed">
                  The initial deposit shall be payable upon signing this
                  Agreement. The 2nd installment of <FillInLine /> shall become
                  payable on <FillInLine /> and subsequent Installment of{" "}
                  <FillInLine /> shall become payable on <FillInLine /> of every
                  month until the purchase price of the product is fully
                  recovered.
                </p>
                <br />
                <p>
                  All payment regarding the Contract/Agreement in reference
                  shall be made to A4&T Account. Take <strong>NOTICE</strong>{" "}
                  that no payment is to be made either via cash or bank transfer
                  into sales Agent account. A4&T shall not be liable for such
                  payments.
                </p>
              </section>
              <section>
                <SectionHeader title="3. Title" />
                <p>
                  A4&T shall retain ownership, title and all interest to the
                  Product sold until full payment of the Purchase Price is
                  received from Customer in accordance with the terms of this
                  Agreement.{" "}
                </p>
              </section>
              <section>
                <SectionHeader title="4. Liens & Encumbrances" />
                <p>
                  Customer shall safely keep the Product free from any liens and
                  encumbrances at the location appearing in the execution
                  section (the “Installation Location”). Customer shall not
                  remove the Product from the Installation Location before the
                  completion of payment of the Purchase Price without A4&T's
                  prior written consent.{" "}
                </p>
              </section>
              <section>
                <SectionHeader title="5. Installation" />
                <p>
                  Customer may self-install the Product or engage the services
                  of an Installer to install the Product at the Installation
                  Location. A4&T assumes no responsibility for the installation
                  of the System by the Customer or an Installer. Customer is
                  solely liable.
                </p>
              </section>
              <section>
                <SectionHeader title="6. Product Warranty" />
                <p>
                  The Product comes with a 3-year warranty which shall be
                  activated from the date of signing this Agreement and covers
                  only a technical malfunction of the Product that prevents the
                  Customer from using the Product, subject to normal wear and
                  tear. Validity of the product warranty is however subject to
                  Customer's compliance with the following terms:
                </p>
                <div className="pl-4 pt-2 list-[lower-roman]">
                  <li>
                    Before completion of payment of the Purchase Price, Customer
                    shall not sell, transfer or lease the Product to a third
                    party;
                  </li>
                  <li>
                    Customer shall promptly report a case of technical
                    malfunction to A4&T by calling the customer experience
                    helpline; and
                  </li>
                  <li>
                    Customer shall not open, repair or tamper with the Product
                    or cause a 3rd Party to open, repair or tamper with the
                    Product.
                  </li>
                </div>
                <br />
                <p>
                  Customer shall not be entitled to claim on the product
                  warranty where it is discovered that the Product has been
                  damaged by Customer or while in Customer's possession and
                  Customer agrees to pay the cost for the repair of the damage
                  to the System or purchase a new Product where a repair is
                  impracticable.
                </p>
                <br />
                <p>
                  Subject to Customer submitting the faulty Product at the
                  location advised by A4&T in order to access the product
                  warranty, A4&T may repair the Product if the warranty is valid
                  or may replace the Product if a repair is impracticable.{" "}
                </p>
              </section>
              <section>
                <SectionHeader title="7. Default & Conditional Refund" />
                <p>
                  Upon any default by the Customer of the terms of this
                  Agreement, A4&T reserves the right to terminate this Agreement
                  and forthwith:
                </p>
                <div className="pl-4 pt-2 list-[lower-roman]">
                  <li>
                    Demand the payment of the outstanding sum of the Purchase
                    Price;
                  </li>
                  <li>
                    Demand the return of the Product at Customer's expense to a
                    location as directed by A4&T; or
                  </li>
                  <li>
                    This agreement may be terminated by A4&T with or without
                    prior notice to the customer if the customer fails,
                    neglects, or is unable to make payment for more than fifteen
                    (15) consecutive days from any due date in which case, A4&T
                    shall deactivate, recover or take back the A4&T item and the
                    customer shall forfeit any payment made hitherto and shall
                    compensate A4&T according to the market price for any
                    damaged or missing parts, accessories and/or components.
                  </li>
                </div>
              </section>
              <section>
                <SectionHeader title="8. Data Protection" />
                <p>
                  By providing A4&T with personal data as requested and signing
                  the Agreement and subject to the relevant data protection laws
                  of Nigeria, Customer hereby agrees and accepts A4&T's Privacy
                  Policy as published on its website and as may be amended from
                  time to time.
                </p>
                <p>
                  Customer consents to receive any text messages, calls
                  (including automated messages and calls) and emails from A4&T
                  and shall promptly notify A4&T by calling the customer
                  experience helpline in the event that Customer wishes to
                  withdraw this consent.
                </p>
                <p>
                  The Customer authorizes the release from time to time to
                  A4&T's affiliates, subsidiaries, 3rd parties, agents,
                  investors, grantor and financing institutions, his personal
                  data for the administration of this Agreement, for marketing
                  purposes. Customer shall have access to the personal data and
                  reserves the right to withdraw this consent.
                </p>
                <p>
                  A4&T may retain the Customer's personal data in accordance
                  with the applicable laws of Nigeria.
                </p>
              </section>{" "}
              <section>
                <SectionHeader title="9. Risk & Liability" />
                <p>
                  The Product is entirely at the risk of the Customer from the
                  moment the Customer takes possession of the Product even when
                  title has not passed to the Customer. The Customer shall be
                  solely accountable and liable to A4&T for the outstanding
                  value of the Product in the event of loss and/or damage not
                  covered by warranty.
                </p>
              </section>
              <section>
                <SectionHeader title="10. Notices" />
                <p>
                  A4&T and Customer choose as their respective addresses for the
                  purpose of notices under this Agreement, and the serving of
                  any process, the addresses set out below and in the execution
                  section. A Party may change its address upon 7 (seven) days’
                  written notice to the other Party. Notice is deemed received
                  if sent by post, within seven (7) days of postage thereof, if
                  hand delivered, on the date of delivery at the address of the
                  receiving Party.
                </p>
                <p>
                  <strong>A4&T</strong> <br />
                  27 Olumoroti Jayeisimi Street <br />
                  Gbagada Phase II <br />
                  Lagos
                </p>
              </section>
              <section>
                <SectionHeader title="11. Severability" />
                <p>
                  If any term of this Agreement shall be held to be illegal,
                  invalid or unenforceable under present or future laws, such
                  terms shall be fully severable, this Agreement shall be
                  construed and enforced as if such illegal, invalid or
                  unenforceable term had never comprised a part of this
                  Agreement; and, the remaining terms of this Agreement shall
                  remain in full force and effect.
                </p>
              </section>
              <section>
                <SectionHeader title="12. Governing Law" />
                <p>
                  This Agreement shall be governed by, and construed in
                  accordance with, the laws of the Federal Republic of Nigeria.
                </p>
              </section>
              <section>
                <SectionHeader title="13. Dispute Resolution" />
                <p>
                  Any and all disputes arising hereunder shall be resolved by a
                  competent court having jurisdiction over such matters in the
                  Federal Republic of Nigeria.
                </p>
              </section>
              <TableOne data={contractData} />
            </div>
          </DataStateWrapper>
        </div>
      </section>
    </div>
  );
};

export default ContractModal;

const ProductSelector = ({ saleItems }: { saleItems: SaleItem[] }) => {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid black", padding: "8px" }}>Product</th>
          <th style={{ border: "1px solid black", padding: "8px" }}>
            Components
          </th>
        </tr>
      </thead>
      <tbody>
        {saleItems.map((item, index) => (
          <tr key={index}>
            <td className="p-2 border border-black capitalize">
              {item?.product.name}
            </td>
            <td className="p-2 border border-black">
              <ul>
                {item?.product?.inventories?.map((inventory, idx) => (
                  <li key={idx} className="capitalize">
                    {inventory?.inventory?.name} - ({inventory?.quantity})
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const TableOne = ({ data }: { data: Contract }) => {
  return (
    <table className="w-full border-collapse border border-black">
      <thead>
        <tr>
          <th
            colSpan={2}
            className="border border-black bg-gray-200 p-2 text-left italic text-[1.15rem] font-bold"
          >
            CUSTOMER HEREBY ACCEPTS THE ABOVE TERMS AND CONDITIONS
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-black p-2 font-bold">
            Name of Customer
          </td>
          <td className="border border-black p-2">{data?.fullNameAsOnID}</td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">
            Phone Numbers (Main and Alternate)
          </td>
          <td className="border border-black p-2">
            {data?.sale[0]?.customer?.phone}
          </td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">Email Address</td>
          <td className="border border-black p-2">
            {data?.sale[0]?.customer?.email}
          </td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">Gender</td>
          <td className="border border-black p-2"></td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">Type of ID & No</td>
          <td className="border border-black p-2">{data?.idType}</td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">ID Number</td>
          <td className="border border-black p-2">{data?.idNumber}</td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">BVN Number</td>
          <td className="border border-black p-2"></td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">
            INSTALLATION ADDRESS
          </td>
          <td className="border border-black p-2">{data?.addressAsOnID}</td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">City/State</td>
          <td className="border border-black p-2"></td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">
            NEXT OF KIN NAME
            <br />
            ADDRESS
            <br />
            PHONE
          </td>
          <td className="border border-black p-2">
            <p>{data?.nextOfKinFullName}</p>
            <p>{data?.nextOfKinHomeAddress}</p>
            <p>{data?.nextOfKinPhoneNumber}</p>
          </td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">
            Commencement Date
          </td>
          <td className="flex gap-4">
            <span className="border-r border-black p-2 w-[28%]">
              {formatDateTime("date", data.createdAt)}
            </span>
            <div className="flex flex-col items-center justify-center text-sm font-medium h-full">
              <span className="leading-none">P</span>
              <span className="leading-none">L</span>
              <span className="leading-none">A</span>
              <span className="leading-none">N</span>
            </div>
            <label className="flex flex-col items-center justify-start p-2">
              <input type="checkbox" />
              <span className="text-sm text-center">6 Months</span>
            </label>
            <label className="flex flex-col items-center justify-start p-2">
              <input type="checkbox" />
              <span className="text-sm text-center">12 Months</span>
            </label>
          </td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">
            Date of Collection
          </td>
          <td className="border border-black p-2"></td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">Signature/Date</td>
          <td className="border border-black p-2"></td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">
            Guarantor's Name
          </td>
          <td className="border border-black p-2">{data?.guarantorFullName}</td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">
            Guarantor's Address
          </td>
          <td className="border border-black p-2">
            {data?.guarantorHomeAddress}
          </td>
        </tr>
        <tr>
          <td className="border border-black p-2 font-bold">
            Guarantor's ID TYPE
          </td>
          <td className="flex">
            <div className="border-r border-black p-2 w-1/2">
              {data?.guarantorIdType}
            </div>
            <div className="p-2 w-1/2">SIGN:</div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
