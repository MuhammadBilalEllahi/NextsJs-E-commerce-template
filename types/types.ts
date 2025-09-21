export interface ContentPage {
  _id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  parentSlug?: string;
  sortOrder: number;
  showInFooter: boolean;
  showInHeader: boolean;
  createdAt: string;
  updatedAt: string;
}
