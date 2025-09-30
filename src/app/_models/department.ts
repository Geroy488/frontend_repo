// file: src/app/_models/department.ts
export interface Department {
  id: number;             // Primary key (numeric ID from backend)
  name: string;           // Department name (e.g., "Engineering")
  description?: string;   // Optional description (e.g., "Software development team")
  employeeCount?: number; // Auto-calculated in backend, displayed in table
}
