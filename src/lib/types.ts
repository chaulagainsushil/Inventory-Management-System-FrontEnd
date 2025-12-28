
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
  pricePerUnitPurchased: number;
  pricePerUnit: number;
  sku: string;
  stockQuantity: number;
  reorderLevel: number;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  roles: string[];
};
