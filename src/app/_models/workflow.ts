export interface Workflow {
  id: number;
  type: 'Onboarding' | 'Leave' | 'Transfer' | 'Promotion' | 'Resignation';
  details: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  employeeId: number;
  request?: {
    id: number;
    type: string;
    items: string;
    status: string;
    employeeId: string;
  };
}
