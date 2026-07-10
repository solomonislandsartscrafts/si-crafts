import type { OrderRequest } from '@/types';

export const mockOrders: OrderRequest[] = [
  {
    id: 'order-1',
    referenceNumber: 'SIAC-2024-001',
    stockistId: 'stockist-1',
    items: [
      { productId: 'prod-1', productCode: 'P-J-1', productName: 'Pandanus Shoulder Bag', quantity: 5, unitPrice: 85.00 },
      { productId: 'prod-7', productCode: 'S-A-1', productName: 'Shell-Money Necklace', quantity: 3, unitPrice: 150.00 },
    ],
    totalAud: 875.00,
    status: 'Confirmed',
    submittedAt: '2024-04-15T10:30:00Z',
    notes: null,
  },
  {
    id: 'order-2',
    referenceNumber: 'SIAC-2024-002',
    stockistId: 'stockist-2',
    items: [
      { productId: 'prod-4', productCode: 'W-P-1', productName: 'Carved Serving Bowl', quantity: 2, unitPrice: 120.00 },
      { productId: 'prod-13', productCode: 'W-T-1', productName: 'Carved Dolphin Ornament', quantity: 6, unitPrice: 60.00 },
      { productId: 'prod-11', productCode: 'P-R-2', productName: 'Pandanus Hand Fan', quantity: 10, unitPrice: 35.00 },
    ],
    totalAud: 950.00,
    status: 'Shipped',
    submittedAt: '2024-05-02T14:00:00Z',
    notes: null,
  },
];
