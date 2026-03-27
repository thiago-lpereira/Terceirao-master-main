import { sql } from '@/lib/db';
export async function GET() {
  const rows = await sql`SELECT * FROM subject ORDER BY display_order`;
  return Response.json(rows);
}