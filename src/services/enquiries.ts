import { apiGet, apiPost, getAdminToken } from '@/lib/api-client';
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

/** Extract items from DRF paginated or plain array response */
function extractItems<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'results' in data) return (data as { results: T[] }).results;
  return [];
}

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
  const raw = await apiPost<{
    id: number; name: string; village: string; province: string;
    craft: string; message: string; contact: string; submitted_at: string; handled: boolean;
  }>('/api/enquiries/maker/', data);
  return {
    id: String(raw.id),
    name: raw.name,
    village: raw.village,
    province: raw.province,
    craft: raw.craft,
    message: raw.message,
    contact: raw.contact,
    submittedAt: raw.submitted_at,
    handled: raw.handled,
  };
}

// --- Stockist Request ---

export interface SubmitStockistRequestInput {
  stockistId: string;
  request: ReplacementTagRequest | CustomBulkRequest;
}

export async function submitStockistRequest(data: SubmitStockistRequestInput): Promise<StockistRequest> {
  const token = getAdminToken();
  const raw = await apiPost<{
    id: number; stockist: number; request_data: unknown; submitted_at: string; handled: boolean;
  }>('/api/enquiries/stockist-request/', {
    stockist: parseInt(data.stockistId),
    request_data: data.request,
  }, token);
  return {
    id: String(raw.id),
    stockistId: String(raw.stockist),
    request: raw.request_data as ReplacementTagRequest | CustomBulkRequest,
    submittedAt: raw.submitted_at,
    handled: raw.handled,
  };
}

// --- Contact Enquiry ---

export interface SubmitContactEnquiryInput {
  name: string;
  email: string;
  reason: ContactReason;
  message: string;
}

export async function submitContactEnquiry(data: SubmitContactEnquiryInput): Promise<ContactEnquiry> {
  const raw = await apiPost<{
    id: number; name: string; email: string; reason: string; message: string;
    submitted_at: string; handled: boolean;
  }>('/api/enquiries/contact/', data);
  return {
    id: String(raw.id),
    name: raw.name,
    email: raw.email,
    reason: raw.reason as ContactReason,
    message: raw.message,
    submittedAt: raw.submitted_at,
    handled: raw.handled,
  };
}

// --- Admin: list all enquiries + mark handled ---

export async function listEnquiries(filter?: EnquiryType): Promise<AnyEnquiry[]> {
  const token = getAdminToken();
  const all: AnyEnquiry[] = [];

  // Fetch all types in parallel
  const [makersRaw, stockistReqsRaw, contactsRaw] = await Promise.all([
    (!filter || filter === 'maker-enquiry')
      ? apiGet<unknown>('/api/enquiries/maker/', token)
      : Promise.resolve([]),
    (!filter || filter === 'stockist-request')
      ? apiGet<unknown>('/api/enquiries/stockist-request/', token)
      : Promise.resolve([]),
    (!filter || filter === 'contact' || filter === 'media')
      ? apiGet<unknown>('/api/enquiries/contact/', token)
      : Promise.resolve([]),
  ]);

  const makers = extractItems<{ id: number; name: string; village: string; province: string; craft: string; message: string; contact: string; submitted_at: string; handled: boolean }>(makersRaw);
  const stockistReqs = extractItems<{ id: number; stockist: number; request_data: unknown; submitted_at: string; handled: boolean }>(stockistReqsRaw);
  const contacts = extractItems<{ id: number; name: string; email: string; reason: string; message: string; submitted_at: string; handled: boolean }>(contactsRaw);

  for (const raw of makers) {
    all.push({
      type: 'maker-enquiry',
      data: { id: String(raw.id), name: raw.name, village: raw.village, province: raw.province, craft: raw.craft, message: raw.message, contact: raw.contact, submittedAt: raw.submitted_at, handled: raw.handled },
    });
  }

  for (const raw of stockistReqs) {
    all.push({
      type: 'stockist-request',
      data: { id: String(raw.id), stockistId: String(raw.stockist), request: raw.request_data as ReplacementTagRequest | CustomBulkRequest, submittedAt: raw.submitted_at, handled: raw.handled },
    });
  }

  for (const raw of contacts) {
    const type = raw.reason === 'media' ? 'media' : 'contact';
    if (filter && filter !== type) continue;
    all.push({
      type: type as 'contact' | 'media',
      data: { id: String(raw.id), name: raw.name, email: raw.email, reason: raw.reason as ContactReason, message: raw.message, submittedAt: raw.submitted_at, handled: raw.handled },
    });
  }

  return all.sort((a, b) => new Date(b.data.submittedAt).getTime() - new Date(a.data.submittedAt).getTime());
}

export async function markHandled(type: EnquiryType, id: string): Promise<boolean> {
  const token = getAdminToken();
  try {
    switch (type) {
      case 'maker-enquiry':
        await apiPost(`/api/enquiries/maker/${id}/handled/`, {}, token);
        return true;
      case 'stockist-request':
        await apiPost(`/api/enquiries/stockist-request/${id}/handled/`, {}, token);
        return true;
      case 'contact':
      case 'media':
        await apiPost(`/api/enquiries/contact/${id}/handled/`, {}, token);
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
}
