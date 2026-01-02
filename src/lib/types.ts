
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
  pricePerUnitPurchased: number;
  stockQuantity: number;
  sku: string;
  leadTimeDays?: number;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  roles: string[];
};

export type Customer = {
  id: number;
  customerName: string;
  phoneNumber: string;
  email: string;
  address: string;
};
