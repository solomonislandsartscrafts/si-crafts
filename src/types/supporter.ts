export interface Supporter {
  id: string;
  name: string;
  logoUrl: string;
  logoAlt: string;
  /** Optional external link. Blank renders the logo unlinked. */
  href: string;
  sortOrder: number;
}
