import { mockOrders } from '@/data/mock';
import type { OrderRequest, CartItem, OrderStatus } from '@/types';

const delay = () => new Promise((r) => setTimeout(r, 0));

let orderCounter = mockOrders.length;

export function generateReferenceNumber(): string {
  orderCounter += 1;
  const year = new Date().getFullYear();
  return `SIAC-${year}-${String(orderCounter).padStart(3, '0')}`;
}

export async function createOrderRequest(
  stockistId: string,
  items: CartItem[]
): Promise<OrderRequest> {
  await delay();
  const totalAud = Number(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2)
  );
  const order: OrderRequest = {
    id: `order-${Date.now()}`,
    referenceNumber: generateReferenceNumber(),
    stockistId,
    items: [...items],
    totalAud,
    status: 'Submitted',
    submittedAt: new Date().toISOString(),
    notes: null,
  };
  mockOrders.push(order);
  return order;
}

export async function getOrdersByStockist(stockistId: string): Promise<OrderRequest[]> {
  await delay();
  return mockOrders
    .filter((o) => o.stockistId === stockistId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export async function getOrderById(id: string): Promise<OrderRequest | null> {
  await delay();
  return mockOrders.find((o) => o.id === id) ?? null;
}

export async function getAllOrders(): Promise<OrderRequest[]> {
  await delay();
  return [...mockOrders].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderRequest | null> {
  await delay();
  const index = mockOrders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  mockOrders[index] = { ...mockOrders[index], status };
  return mockOrders[index];
}
