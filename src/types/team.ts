export interface TeamMember {
  id: string;
  name: string;
  location: string | null;
  bio: string | null;
  photoUrl: string | null;
  photoAlt: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
