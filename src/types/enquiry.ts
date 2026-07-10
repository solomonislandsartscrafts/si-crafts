// --- Maker Enquiry: a maker wanting to sell to SIAC ---
export interface MakerEnquiry {
  id: string;
  name: string;
  village: string;
  province: string;
  craft: string; // what they make / materials used
  message: string;
  contact: string; // phone, email, or however they can be reached
  submittedAt: string;
  handled: boolean;
}

// --- Stockist Request: discriminated union ---
export type StockistRequestKind = 'replacement-tag' | 'custom-bulk';

export interface ReplacementTagRequest {
  kind: 'replacement-tag';
  productCode: string;
  quantity: number;
}

export interface CustomBulkRequest {
  kind: 'custom-bulk';
  product: string;
  customisation: string; // e.g. "name woven into a bag"
  quantity: number;
  notes: string;
}

export interface StockistRequest {
  id: string;
  stockistId: string;
  request: ReplacementTagRequest | CustomBulkRequest;
  submittedAt: string;
  handled: boolean;
}

// --- Contact Enquiry ---
export type ContactReason = 'general' | 'media';

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  reason: ContactReason;
  message: string;
  submittedAt: string;
  handled: boolean;
}

// --- Union for admin inbox filtering ---
export type EnquiryType = 'maker-enquiry' | 'stockist-request' | 'contact' | 'media';

export type AnyEnquiry =
  | { type: 'maker-enquiry'; data: MakerEnquiry }
  | { type: 'stockist-request'; data: StockistRequest }
  | { type: 'contact'; data: ContactEnquiry }
  | { type: 'media'; data: ContactEnquiry };
