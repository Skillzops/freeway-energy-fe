import { types, Instance } from "mobx-state-tree";

const ProductModel = types.model({
  productId: types.union(types.string),
  productImage: types.string,
  productTag: types.string,
  productName: types.string,
  productPrice: types.string,
  productUnits: types.number,
});

const contractStore = types
  .model({
    products: types.array(ProductModel),
    doesProductCategoriesExist: types.boolean,
  })
  .actions((self) => ({
    addProduct(product: any) {
      self.products.push(product);
    },
    removeProduct(productId?: string) {
      const index = self.products.findIndex((p) => p.productId === productId);
      if (index !== -1) {
        self.products.splice(index, 1);
      }
    },
    updateProduct(
      productId: string,
      updatedFields: Partial<Instance<typeof ProductModel>>
    ) {
      const product = self.products.find((p) => p.productId === productId);
      if (product) {
        Object.assign(product, updatedFields);
      }
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

export const ContractStore = contractStore.create({
  products: [],
  doesProductCategoriesExist: true,
});

export type ContractStoreType = Instance<typeof contractStore>;
