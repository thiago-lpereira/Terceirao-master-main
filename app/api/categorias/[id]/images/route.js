import { sql } from '@/lib/db';

export async function GET(req, { params }) {
  const { id } = await params;
  const rows = await sql`
    SELECT * FROM gallery_image WHERE categoria_id = ${id}
    ORDER BY display_order, id`;
  return Response.json(rows);
}

export async function POST(req, { params }) {
  const { id } = await params;
  const { imageUrl, subtitle } = await req.json();
  const max = await sql`SELECT COALESCE(MAX(display_order),0) AS m FROM gallery_image WHERE categoria_id=${id}`;
  const [row] = await sql`
    INSERT INTO gallery_image (categoria_id, image_url, subtitle, display_order)
    VALUES (${id}, ${imageUrl}, ${subtitle||null}, ${max[0].m+1}) RETURNING *`;
  return Response.json(row);
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const { imageId } = await req.json();
  await sql`DELETE FROM gallery_image WHERE id=${imageId} AND categoria_id=${id}`;
  return Response.json({ ok: true });
}