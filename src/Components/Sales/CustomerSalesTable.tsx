const CustomerSalesTable = ({
  customerData,
  customerSelected,
  onRowClick,
  onRemoveCustomer,
}: {
  customerData: {
    sn: number;
    customerId: string;
    customerName: string;
    firstname: string;
    lastname: string;
    location: string;
    email: string;
    phone:string;
    [key: string]: any;
  }[];
  customerSelected: {
    customerId: string;
    customerName: string;
  } | null;
  onRowClick: (data: any) => void;
  onRemoveCustomer: () => void;
}) => {
  const columns = [
    { key: "sn", title: "S/N" },
    { key: "customerName", title: "NAME" },
    { key: "location", title: "LOCATION" },
    { key: "email", title: "EMAIL" },
  ];

  // Function to control displayed keys
  const mapDisplayData = (row: Record<string, any>) => ({
    sn: row.sn,
    customerName: row.customerName,
    location: row.location,
    email: row.email,
  });

  // Check if a customer is selected
  const isCustomerSelected = (id: string) =>
    customerSelected?.customerId === id;

  return (
    <section className="w-full p-[16px_16px_4px_16px] border-[0.6px] border-strokeGreyThree rounded-[20px]">
      <table className="w-full">
        {/* Table Header */}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="p-2 text-xs font-light text-left text-textDarkGrey border-b-[0.2px] border-strokeGreyThree"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-strokeGreyTwo rounded-full"></span>
                    <span>{column.title}</span>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {customerData?.map((row, rowIndex) => {
            const displayData = mapDisplayData(row);
            const isLastRow = rowIndex === customerData.length - 1;
            const isSelected = isCustomerSelected(row.customerId);

            return (
              <tr
                key={rowIndex}
                className={`cursor-pointer ${
                  isSelected ? "bg-[#E3FAD6]" : "hover:bg-[#E3FAD6]"
                }`}
                onClick={() => {
                  if (isSelected) onRemoveCustomer();
                  else onRowClick(row);
                }}
              >
                {columns.map((column, index) => (
                  <td
                    key={index}
                    className={`px-2 py-2 text-xs text-textDarkGrey ${
                      isLastRow ? "" : "border-b-[0.2px] border-strokeGreyThree"
                    }`}
                  >
                    {displayData[column.key as keyof typeof displayData]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};

export default CustomerSalesTable;
