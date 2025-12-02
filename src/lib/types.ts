
export type Category = {
  id: number;
  name: string;
  description: string;
};

export type Supplier = {
  id: number;
  name: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  address: string;
};

export type Product = {
  id: number;
  categoryId: number;
  supplierId: number;
  productName: string;
  description: string;
  pricePerUnit: number;
  sku: string;
  quantityPerUnit: string;
  reoredLevel: number;
};
