import { sql } from '@/lib/db';

export async function GET() {
  const rows = await sql`SELECT * FROM categoria ORDER BY display_order, id`;
  return Response.json(rows);
}

export async function POST(req) {
  const { name, thumbnailUrl, displayOrder } = await req.json();
  const maxOrder = await sql`SELECT COALESCE(MAX(display_order),0) AS m FROM categoria`;
  const order = displayOrder ?? (maxOrder[0].m + 1);
  const [row] = await sql`
    INSERT INTO categoria (name, thumbnail_url, display_order)
    VALUES (${name}, ${thumbnailUrl}, ${order}) RETURNING *`;
  return Response.json(row);
}

export async function PUT(req) {
  const { id, name, thumbnailUrl, displayOrder } = await req.json();
  const [row] = await sql`
    UPDATE categoria SET
      name = COALESCE(${name}, name),
      thumbnail_url = COALESCE(${thumbnailUrl}, thumbnail_url),
      display_order = COALESCE(${displayOrder}, display_order)
    WHERE id = ${id} RETURNING *`;
  return Response.json(row);
}