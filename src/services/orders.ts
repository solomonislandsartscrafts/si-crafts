import { apiGet, apiPost, apiPatch, getAdminToken, getStockistToken } from '@/lib/api-client';
import type { OrderRequest, CartItem, OrderStatus } from '@/types';

interface OrderItemResponse {
  id: number;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: string | number;
  line_total: string | number;
}

interface OrderResponse {
  id: number;
  reference_number: string;
  stockist: number;
  stockist_name: string;
  total_aud: string | number;
  status: string;
  notes: string;
  items: OrderItemResponse[];
  submitted_at: string;
  updated_at: string;
}

function mapOrder(raw: OrderResponse): OrderRequest {
  return {
    id: String(raw.id),
    referenceNumber: raw.reference_number,
    stockistId: String(raw.stockist),
    items: raw.items.map((item) => ({
      productId: '',
      productCode: item.product_code,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : item.unit_price,
    })),
    totalAud: typeof raw.total_aud === 'string' ? parseFloat(raw.total_aud) : raw.total_aud,
    status: raw.status as OrderStatus,
    submittedAt: raw.submitted_at,
    notes: raw.notes || null,
  };
}

export function generateReferenceNumber(): string {
  // Server generates this now — placeholder for backwards compat
  const year = new Date().getFullYear();
  return `SIAC-${year}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function createOrderRequest(
  stockistId: string,
  items: CartItem[]
): Promise<OrderRequest> {
  const token = getStockistToken();
  const totalAud = Number(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2)
  );

  // Compile item notes into the order-level notes field
  const itemNotes = items
    .filter((item) => item.note?.trim())
    .map((item) => `${item.productCode}: ${item.note}`)
    .join('\n');

  const raw = await apiPost<OrderResponse>('/api/orders/', {
    stockist: parseInt(stockistId),
    total_aud: totalAud,
    notes: itemNotes || '',
    items: items.map((item) => ({
      product_code: item.productCode,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })),
  }, token);
  return mapOrder(raw);
}

export async function getOrdersByStockist(stockistId: string): Promise<OrderRequest[]> {
  const token = getStockistToken();
  const data = await apiGet<{ results: OrderResponse[] } | OrderResponse[]>(`/api/orders/?stockist=${stockistId}`, token);
  const items = Array.isArray(data) ? data : data.results ?? [];
  return items.map(mapOrder);
}

export async function getOrderById(id: string): Promise<OrderRequest | null> {
  const token = getAdminToken() || getStockistToken();
  try {
    const raw = await apiGet<OrderResponse>(`/api/orders/${id}/`, token);
    return mapOrder(raw);
  } catch {
    return null;
  }
}

export async function getAllOrders(): Promise<OrderRequest[]> {
  const token = getAdminToken();
  const data = await apiGet<{ results: OrderResponse[] } | OrderResponse[]>('/api/orders/', token);
  const items = Array.isArray(data) ? data : data.results ?? [];
  return items.map(mapOrder);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderRequest | null> {
  const token = getAdminToken();
  const raw = await apiPatch<OrderResponse>(`/api/orders/${id}/update_status/`, { status }, token);
  return mapOrder(raw);
}
