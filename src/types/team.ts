export interface TeamMember {
  id: string;
  name: string;
  location: string | null;
  bio: string | null;
  photoUrl: string | null;
  photoAlt: string;
  photoPosition: string | null; // object-position value e.g. "50% 30%"
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
