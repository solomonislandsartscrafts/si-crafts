export type OrderStatus = 'Submitted' | 'Confirmed' | 'Shipped';

export interface CartItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderRequest {
  id: string;
  referenceNumber: string;
  stockistId: string;
  items: CartItem[];
  totalAud: number;
  status: OrderStatus;
  submittedAt: string;
  notes: string | null;
}
