/** Severity used to colour attention items and badges. */
export type AttentionSeverity = 'error' | 'warning' | 'info';

/** Something an admin should look at, with a direct link to fix it. */
export interface AttentionItem {
  id: string;
  severity: AttentionSeverity;
  /** Short summary, e.g. "3 products missing image alt text" */
  label: string;
  /** Why it matters / what to do about it */
  detail: string;
  count: number;
  href: string;
}

/** A recent change or submission, newest first. */
export interface ActivityItem {
  id: string;
  kind: 'maker' | 'product' | 'article' | 'order' | 'enquiry' | 'stockist';
  label: string;
  detail: string;
  /** ISO timestamp */
  at: string;
  href: string;
}

/** Which setup steps have content. Drives the Getting Started progress. */
export interface SetupProgress {
  categories: number;
  crafts: number;
  makers: number;
  products: number;
  articles: number;
  siteImages: number;
}

export interface DashboardCounts {
  makers: number;
  makersPublished: number;
  products: number;
  productsPublished: number;
  crafts: number;
  categories: number;
  articles: number;
  articlesPublished: number;
  stockists: number;
  stockistsApproved: number;
  stockistsPending: number;
  orders: number;
  ordersToAction: number;
  openEnquiries: number;
}

export interface DashboardSummary {
  counts: DashboardCounts;
  setup: SetupProgress;
  attention: AttentionItem[];
  activity: ActivityItem[];
}
