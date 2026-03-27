// app/api/events/route.js
import { sql } from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get('all') === '1';

  if (all) {
    const rows = await sql`
      SELECT e.*, c.name AS creator_name, c.hash_code
      FROM event e
      LEFT JOIN creator c ON c.id = e.creator_id
      ORDER BY e.event_date ASC`;
    return Response.json(rows);
  }

  const rows = await sql`
    SELECT e.*, c.name AS creator_name, c.hash_code
    FROM event e
    LEFT JOIN creator c ON c.id = e.creator_id
    WHERE e.event_date >= CURRENT_DATE
    ORDER BY e.event_date ASC`;
  return Response.json(rows);
}

export async function POST(req) {
  const { title, description, eventDate, timeStart, timeEnd, imageUrl, type, creatorId, responsibleNames } = await req.json();
  if (!title || !eventDate) return Response.json({ error: 'Missing fields' }, { status: 400 });
  const [row] = await sql`
    INSERT INTO event (title, description, event_date, time_start, time_end, image_url, type, creator_id, responsible_names)
    VALUES (${title}, ${description||null}, ${eventDate}, ${timeStart||null}, ${timeEnd||null},
            ${imageUrl||null}, ${type||'Trabalho'}, ${creatorId||null}, ${responsibleNames||null})
    RETURNING *`;
  return Response.json(row);
}

// 🛑 ADDED THIS FUNCTION TO HANDLE DELETION
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
  
  await sql`DELETE FROM event WHERE id = ${id}`;
  return Response.json({ success: true });
}