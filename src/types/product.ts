export interface Product {
  id: number;
  name: string;
  description?: string | null;
  unitPrice: number;
  unit?: string | null;
  category?: string | null;
  isActive: boolean;
  business: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  unitPrice: number;
  unit?: string;
  category?: string;
}
