export interface Employee {
  id: number;
  employeeId: string;
  accountId: number;
  position: string;
  // department (name) for display; departmentId is the actual FK
  department?: string;
  departmentId?: number;
  hireDate: string;   // or Date
  status: string;
  account?: {
    email: string;
    status: string;
  };
}
