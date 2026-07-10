export type StockistStatus = 'pending' | 'approved' | 'rejected';

export interface Stockist {
  id: string;
  businessName: string;
  abn: string;
  contactName: string;
  email: string;
  phone: string;
  description: string;
  status: StockistStatus;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}
