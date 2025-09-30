export interface Request {
  employeeId: number;
  type: string;
  items: string;
  status: string;
    account?: {
      email: string;
      status: string;
    };
  };

