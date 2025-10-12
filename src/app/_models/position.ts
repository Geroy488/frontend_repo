export interface Position {
  id: number;
  name: string;
  description?: string;
  status: 'ENABLE' | 'DISABLE';   // ✅ add this
}
