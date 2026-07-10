import {
  mockMakerEnquiries,
  mockStockistRequests,
  mockContactEnquiries,
} from '@/data/mock';
import type {
  MakerEnquiry,
  StockistRequest,
  ContactEnquiry,
  ReplacementTagRequest,
  CustomBulkRequest,
  ContactReason,
  AnyEnquiry,
  EnquiryType,
} from '@/types';

const delay = () => new Promise((r) => setTimeout(r, 0));

// --- Maker Enquiry ---

export interface SubmitMakerEnquiryInput {
  name: string;
  village: string;
  province: string;
  craft: string;
  message: string;
  contact: string;
}

export async function submitMakerEnquiry(data: SubmitMakerEnquiryInput): Promise<MakerEnquiry> {
  await delay();
  const enquiry: MakerEnquiry = {
    ...data,
    id: `menq-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    handled: false,
  };
  mockMakerEnquiries.push(enquiry);
  return enquiry;
}

// --- Stockist Request ---

export interface SubmitStockistRequestInput {
  stockistId: string;
  request: ReplacementTagRequest | CustomBulkRequest;
}

export async function submitStockistRequest(data: SubmitStockistRequestInput): Promise<StockistRequest> {
  await delay();
  const req: StockistRequest = {
    id: `sreq-${Date.now()}`,
    stockistId: data.stockistId,
    request: data.request,
    submittedAt: new Date().toISOString(),
    handled: false,
  };
  mockStockistRequests.push(req);
  return req;
}

// --- Contact Enquiry ---

export interface SubmitContactEnquiryInput {
  name: string;
  email: string;
  reason: ContactReason;
  message: string;
}

export async function submitContactEnquiry(data: SubmitContactEnquiryInput): Promise<ContactEnquiry> {
  await delay();
  const enquiry: ContactEnquiry = {
    ...data,
    id: `cenq-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    handled: false,
  };
  mockContactEnquiries.push(enquiry);
  return enquiry;
}

// --- Admin: list all enquiries + mark handled ---

export async function listEnquiries(filter?: EnquiryType): Promise<AnyEnquiry[]> {
  await delay();
  const all: AnyEnquiry[] = [
    ...mockMakerEnquiries.map((d) => ({ type: 'maker-enquiry' as const, data: d })),
    ...mockStockistRequests.map((d) => ({ type: 'stockist-request' as const, data: d })),
    ...mockContactEnquiries
      .filter((d) => d.reason === 'general')
      .map((d) => ({ type: 'contact' as const, data: d })),
    ...mockContactEnquiries
      .filter((d) => d.reason === 'media')
      .map((d) => ({ type: 'media' as const, data: d })),
  ];

  const filtered = filter ? all.filter((e) => e.type === filter) : all;

  // Sort newest first
  return filtered.sort(
    (a, b) => new Date(b.data.submittedAt).getTime() - new Date(a.data.submittedAt).getTime()
  );
}

export async function markHandled(type: EnquiryType, id: string): Promise<boolean> {
  await delay();
  switch (type) {
    case 'maker-enquiry': {
      const item = mockMakerEnquiries.find((e) => e.id === id);
      if (item) { item.handled = true; return true; }
      return false;
    }
    case 'stockist-request': {
      const item = mockStockistRequests.find((e) => e.id === id);
      if (item) { item.handled = true; return true; }
      return false;
    }
    case 'contact':
    case 'media': {
      const item = mockContactEnquiries.find((e) => e.id === id);
      if (item) { item.handled = true; return true; }
      return false;
    }
    default:
      return false;
  }
}
