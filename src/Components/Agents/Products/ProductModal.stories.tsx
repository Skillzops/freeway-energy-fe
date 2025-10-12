import { Meta, StoryFn } from "@storybook/react";
import ProductModal from "./ProductModal";
import { CardComponent } from "../CardComponents/CardComponent";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import solarpanel from "../../assets/table/solar-panel.png";

export default {
  title: "Components/Product",
  component: ProductModal,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta;

const CardTemplate: StoryFn<any> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <CardComponent
        key={"124242"}
        variant="product-no-image"
        productTag="EAAS"
        productId="124242"
        productPrice={"4000"}
        dropDownList={{
          items: ["View Product", "Cancel Product"],
          onClickLink: (index: number) => {
            switch (index) {
              case 0:
                setIsOpen(true);
                break;
              case 1:
                console.log("Cancel product");
                break;
              default:
                break;
            }
          },
          defaultStyle: true,
          showCustomButton: true,
        }}
      />
      <ProductModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        productID={""}
        refreshTable={Promise.resolve}
      />
    </>
  );
};

export const Default = CardTemplate.bind({});
Default.args = {
  productData: {
    productTag: "EAAS",
    productId: 124242,
    productImage: solarpanel,
    productPrice: 1200000,
    paymentModes: ["One-Time", "Installmental"],
    datetime: "2024-11-07T22:43:08.271156Z",
    name: "Ahire Tersoo",
  },
  inventoryData: Array.from({ length: 10 }, () => ({
    productImage: solarpanel,
    productName: "Monochromatic Solar Panels",
    productPrice: 250000,
  })),
};
