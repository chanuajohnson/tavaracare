
export interface CarePlan {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'cancelled';
  familyId: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}
