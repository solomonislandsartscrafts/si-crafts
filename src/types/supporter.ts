export interface Supporter {
  id: string;
  name: string;
  logoUrl: string;
  logoAlt: string;
  /** Optional external link. Blank renders the logo unlinked. */
  href: string;
  sortOrder: number;
  /**
   * Suspended supporters (active === false) stay in the admin list but are
   * hidden from the public homepage banner. Lets an admin take a logo down
   * without deleting the record.
   */
  active: boolean;
}
