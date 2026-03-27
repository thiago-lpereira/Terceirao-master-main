import { sql } from '@/lib/db';

export async function GET() {
  const rows = await sql`SELECT * FROM schedule_event ORDER BY event_date`;
  return Response.json(rows);
}

export async function POST(req) {
  const { title, subtitle, eventDate, type } = await req.json();
  const [row] = await sql`
    INSERT INTO schedule_event (title, subtitle, event_date, type)
    VALUES (${title}, ${subtitle||null}, ${eventDate}, ${type||'Prova'}) RETURNING *`;
  return Response.json(row);
}