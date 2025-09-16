export interface Employee {
  accountId: number;
  email: string;
  status: string;
  employeeId?: string;
  position?: string | null;
  department?: string | null;
  hireDate?: string | null;
}
