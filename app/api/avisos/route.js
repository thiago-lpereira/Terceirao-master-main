import { sql } from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const todayOnly = searchParams.get('today') === '1';
  const rows = todayOnly
    ? await sql`SELECT * FROM aviso WHERE aviso_date = CURRENT_DATE ORDER BY created_at DESC`
    : await sql`SELECT * FROM aviso ORDER BY aviso_date DESC, created_at DESC`;
  return Response.json(rows);
}

export async function POST(req) {
  const { content, date } = await req.json();
  const [row] = await sql`
    INSERT INTO aviso (content, aviso_date)
    VALUES (${content}, ${date || new Date().toISOString().slice(0,10)})
    RETURNING *`;
  return Response.json(row);
}