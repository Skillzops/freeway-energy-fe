import { types, Instance } from "mobx-state-tree";

const ProductModel = types.model({
  productId: types.union(types.string),
  productImage: types.string,
  productTag: types.string,
  productName: types.string,
  productPrice: types.string,
  productUnits: types.number,
});

const productStore = types
  .model({
    products: types.array(ProductModel),
    doesProductCategoriesExist: types.boolean,
  })
  .actions((self) => ({
    addProduct(product: any) {
      const existingIndex = self.products.findIndex(
        (p) => p.productId === product.productId
      );

      if (existingIndex !== -1) {
        // Update existing product
        self.products[existingIndex] = {
          ...self.products[existingIndex],
          ...product,
        };
      } else {
        // Add new product
        self.products.push(product);
      }
    },
    removeProduct(productId?: string) {
      const index = self.products.findIndex((p) => p.productId === productId);
      if (index !== -1) {
        self.products.splice(index, 1);
      }
    },
    currentProductUnits(productId?: string) {
      const currentUnits = self.products.find(
        (p) => p.productId === productId
      )?.productUnits;
      return currentUnits;
    },
    getProductById(productId: string) {
      const product = self.products.find(
        (product) => product.productId === productId
      );
      return product;
    },
    emptyProducts() {
      self.products.clear();
    },
    setProductCategoriesExist(value: boolean) {
      self.doesProductCategoriesExist = value;
    },
  }));

export const ProductStore = productStore.create({
  products: [],
  doesProductCategoriesExist: true,
});

export type ProductStoreType = Instance<typeof productStore>;
