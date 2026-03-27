import { sql } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req) {
  const { name } = await req.json();
  if (!name?.trim()) return Response.json({ error: 'Name required' }, { status: 400 });

  // Check if creator with this name already exists
  const existing = await sql`SELECT * FROM creator WHERE LOWER(name) = LOWER(${name.trim()}) LIMIT 1`;
  if (existing.length) return Response.json(existing[0]);

  const hash = crypto.randomBytes(4).toString('hex').toUpperCase();
  const [row] = await sql`
    INSERT INTO creator (name, hash_code) VALUES (${name.trim()}, ${hash}) RETURNING *`;
  return Response.json(row);
}