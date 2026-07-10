import type { MakerEnquiry, StockistRequest, ContactEnquiry } from '@/types';

export const mockMakerEnquiries: MakerEnquiry[] = [
  {
    id: 'menq-1',
    name: 'David Pitu',
    village: 'Buala',
    province: 'Isabel Province',
    craft: 'Wood carving — small bowls and fish from local ebony',
    message: 'I have been carving for 15 years and sell at the Buala market. I would like to know how I can sell my carvings to shops in Australia.',
    contact: '+677 7412345',
    submittedAt: '2024-05-20T08:30:00Z',
    handled: false,
  },
];

export const mockStockistRequests: StockistRequest[] = [
  {
    id: 'sreq-1',
    stockistId: 'stockist-1',
    request: { kind: 'replacement-tag', productCode: 'P-J-1', quantity: 3 },
    submittedAt: '2024-06-01T10:00:00Z',
    handled: false,
  },
  {
    id: 'sreq-2',
    stockistId: 'stockist-2',
    request: { kind: 'custom-bulk', product: 'Pandanus Shoulder Bag', customisation: 'Gallery name woven into the border', quantity: 10, notes: 'Need by September for exhibition opening' },
    submittedAt: '2024-06-03T14:20:00Z',
    handled: false,
  },
];

export const mockContactEnquiries: ContactEnquiry[] = [
  {
    id: 'cenq-1',
    name: 'Sarah Nguyen',
    email: 'sarah.nguyen@artsreview.com.au',
    reason: 'media',
    message: 'I am writing a feature on Pacific arts for Arts Review magazine. Could I interview someone from SIAC about your provenance model?',
    submittedAt: '2024-05-28T09:15:00Z',
    handled: false,
  },
  {
    id: 'cenq-2',
    name: 'Mark Thompson',
    email: 'mark@gmail.com',
    reason: 'general',
    message: 'I bought a shell necklace from the museum shop and love it. Just wanted to say thanks for connecting us to the makers.',
    submittedAt: '2024-06-02T16:45:00Z',
    handled: true,
  },
];
